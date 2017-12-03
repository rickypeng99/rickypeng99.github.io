---
layout: wiki
permalink: /llvm-cs/en/CSharpLangImpl03/
title: "Kaleidoscope: Implementing a Language with LLVM in CSharp"
---

# 3. Kaleidoscope: Code generation to LLVM IR

## 3.1. Chapter 3 Introduction

Welcome to Chapter 3 of the "[Implementing a language with LLVM](../)" tutorial. This chapter shows you how to transform the Abstract Syntax Tree, built in Chapter 2, into LLVM IR. This will teach you a little bit about how LLVM does things, as well as demonstrate how easy it is to use. It's much more work to build a lexer and parser than it is to generate LLVM IR code. :)

Please note: the code in this chapter and later require LLVM 3.7 or later. LLVM 3.6 and before will not work with it. Also note that you need to use a version of this tutorial that matches your LLVM release: If you are using an official LLVM release, use the version of the documentation included with your release or on the [llvm.org releases page](http://llvm.org/releases/).

## 3.2. Code Generation Setup

In order to generate LLVM IR, we want some simple setup to get started. First we define virtual code generation (`VisitChildren`) methods in each AST class:

```c#
namespace Kaleidoscope.AST
{
   public abstract class ExprAST
   {
      public abstract ExprType NodeType { get; protected set; }

      protected internal virtual ExprAST VisitChildren(ExprVisitor visitor)
      {
        return visitor.Visit(this);
      }

      protected internal virtual ExprAST Accept(ExprVisitor visitor)
      {
        return visitor.VisitExtension(this);
      }
   }
}
```

The `Visit()` method says to emit IR for that AST node along with all the things it depends on, and they all return an LLVM Value object.
"LLVMValueRef" is the class used to represent a "[Static Single Assignment](http://en.wikipedia.org/wiki/Static_single_assignment_form) (SSA) register" or "SSA value" in LLVM. The most distinct aspect of SSA values is that their value is computed as the related instruction executes, and it does not get a new value until (and if) the instruction re-executes. In other words, there is no way to "change" an SSA value. For more information, please read up on Static Single Assignment - the concepts are really quite natural once you grok them.

Note that instead of adding virtual methods to the `ExprAST` class hierarchy, it could also make sense to use a visitor pattern or some other way to model this. Again, this tutorial won't dwell on good software engineering practices: for our purposes, adding a virtual method is simplest.

```c#
private readonly LLVMModuleRef module;

private readonly LLVMBuilderRef builder;

private readonly Dictionary<string, LLVMValueRef> namedValues = new Dictionary<string, LLVMValueRef>();

private readonly Stack<LLVMValueRef> valueStack = new Stack<LLVMValueRef>();
```

The static variables will be used during code generation.

The `builder` object is a helper object that makes it easy to generate LLVM instructions. Instances of the `LLVMBuilderRef` class template keep track of the current place to insert instructions and has methods to create new instructions.

`module` is an LLVM construct that contains functions and global variables. In many ways, it is the top-level structure that the LLVM IR uses to contain code. It will own the memory for all of the IR that we generate.

The `namedValues` map keeps track of which values are defined in the current scope and what their LLVM representation is. (In other words, it is a symbol table for the code). In this form of Kaleidoscope, the only things that can be referenced are function parameters. As such, function parameters will be in this map when generating code for their function body.

With these basics in place, we can start talking about how to generate code for each expression. Note that this assumes that the `builder` has been set up to generate code into something. For now, we'll assume that this has already been done, and we'll just use it to emit code.

## 3.3. Expression Code Generation

Generating LLVM code for expression nodes is very straightforward: less than 45 lines of commented code for all four of our expression nodes. First we'll do numeric literals:

```c#
protected override ExprAST VisitNumberExprAST(NumberExprAST node)
{
  this.valueStack.Push(LLVM.ConstReal(LLVM.DoubleType(), node.Value));
  return node;
}
```

In the LLVM IR, numeric constants are represented with a `LLVMValueRef` instance too. This code basically just creates and pushes a `LLVMValueRef`.

```c#
protected override ExprAST VisitVariableExprAST(VariableExprAST node)
{
  LLVMValueRef value;

  // Look this variable up in the function.
  if (this.namedValues.TryGetValue(node.Name, out value))
  {
     this.valueStack.Push(value);
  }
  else
  {
     throw new Exception("Unknown variable name");
  }

  return node;
}
```

References to variables are also quite simple using LLVM. In the simple version of Kaleidoscope, we assume that the variable has already been emitted somewhere and its value is available. In practice, the only values that can be in the `namedValues` map are function arguments. This code simply checks to see that the specified name is in the map (if not, an unknown variable is being referenced) and returns the value for it. In future chapters, we'll add support for loop induction variables in the symbol table, and for local variables.

```c#
protected override ExprAST VisitBinaryExprAST(BinaryExprAST node)
{
  this.Visit(node.Lhs);
  this.Visit(node.Rhs);

  LLVMValueRef r = this.valueStack.Pop();
  LLVMValueRef l = this.valueStack.Pop();

  LLVMValueRef n;

  switch (node.NodeType)
  {
    case ExprType.AddExpr:
      n = LLVM.BuildFAdd(this.builder, l, r, "addtmp");
      break;
    case ExprType.SubtractExpr:
      n = LLVM.BuildFSub(this.builder, l, r, "subtmp");
      break;
    case ExprType.MultiplyExpr:
      n = LLVM.BuildFMul(this.builder, l, r, "multmp");
      break;
    case ExprType.LessThanExpr:
      // Convert bool 0/1 to double 0.0 or 1.0
      n = LLVM.BuildUIToFP(this.builder, LLVM.BuildFCmp(this.builder, LLVMRealPredicate.LLVMRealULT, l, r, "cmptmp"), LLVM.DoubleType(), "booltmp");
      break;
    default:
      throw new Exception("invalid binary operator");
  }

  this.valueStack.Push(n);
  return node;
}
```

Binary operators start to get more interesting. The basic idea here is that we recursively emit code for the left-hand side of the expression, then the right-hand side, then we compute the result of the binary expression. In this code, we do a simple switch on the opcode to create the right LLVM instruction.

In the example above, the LLVM `builder` class is starting to show its value. `LLVMBuilderRef` knows where to insert the newly created instruction, all you have to do is speicecify what instruction to create (e.g. with `CreateFAdd`), which operands to use (L and R here) and optionally provide a name for the generated instruction.

One nice thing about LLVM is that the name is just a hint. For instance, if the code above emits multiple `addtmp` variables, LLVM will automatically provide each one with an increasing, unique numeric suffix. Local value names for instructions are purely optional, but it makes it much easier to read the IR dumps.

[LLVM instructions](http://releases.llvm.org/5.0.0/docs/LangRef.html#instruction-reference)
are constrained by strict rules:
for example, the Left and Right operators of an
[add instruction](http://releases.llvm.org/5.0.0/docs/LangRef.html#add-instruction)
must have the same type, and the result type of the add must match the operand types.
Because all values in Kaleidoscope are doubles,
this makes for very simple code for add, sub and mul.

On the other hand, LLVM specifies that the
[fcmp instruction](http://releases.llvm.org/5.0.0/docs/LangRef.html#fcmp-instruction)
always returns an `i1` value (a one bit integer).
The problem with this is that Kaleidoscope wants the value to be a 0.0 or 1.0 value. In order to get these semantics, we combine the fcmp instruction with a
[uitofp instruction](http://releases.llvm.org/5.0.0/docs/LangRef.html#uitofp-to-instruction)
. This instruction converts its input integer into a floating point value by treating the input as an unsigned value. In contrast, if we used the
[sitofp instruction](http://releases.llvm.org/5.0.0/docs/LangRef.html#sitofp-to-instruction)
, the Kaleidoscope `<` operator would return 0.0 and -1.0, depending on the input value.


```c#
protected override ExprAST VisitCallExprAST(CallExprAST node)
{
  var calleeF = LLVM.GetNamedFunction(this.module, node.Callee);
  if (calleeF.Pointer == IntPtr.Zero)
  {
    throw new Exception("Unknown function referenced");
  }

  if (LLVM.CountParams(calleeF) != node.Arguments.Count)
  {
    throw new Exception("Incorrect # arguments passed");
  }

  var argumentCount = (uint) node.Arguments.Count;
  var argsV = new LLVMValueRef[argumentCount];
  for (int i = 0; i < argumentCount; ++i)
  {
    this.Visit(node.Arguments[i]);
    argsV[i] = this.valueStack.Pop();
  }

  valueStack.Push(LLVM.BuildCall(this.builder, calleeF, argsV, "calltmp"));

  return node;
}
```

Code generation for function calls is quite straightforward with LLVM. The code above initially does a function name lookup in the LLVM Module's symbol table. Recall that the LLVM Module is the container that holds the functions we are JIT'ing.
By giving each function the same name as what the user specifies, we can use the LLVM symbol table to resolve function names for us.

Once we have the function to call, we recursively codegen each argument that is to be passed in, and create an LLVM
[call instruction](http://releases.llvm.org/5.0.0/docs/LangRef.html#call-instruction).
Note that LLVM uses the native C calling conventions by default,
allowing these calls to also call into standard library functions like `sin` and `cos`,
with no additional effort.

This wraps up our handling of the four basic expressions that we have so far in Kaleidoscope. Feel free to go in and add some more.
For example, by browsing the
[LLVM language reference](http://releases.llvm.org/5.0.0/docs/LangRef.html)
you'll find several other interesting instructions that are really easy to plug into our basic framework.

## 3.4. Function Code Generation

Code generation for prototypes and functions must handle a number of details, which make their code less beautiful than expression code generation, but allows us to illustrate some important points. First, lets talk about code generation for prototypes: they are used both for function bodies and external function declarations. The code starts with:

```c#
protected override ExprAST VisitPrototypeAST(PrototypeAST node)
{
  // Make the function type:  double(double,double) etc.
  var argumentCount = (uint) node.Arguments.Count;
  var arguments = new LLVMTypeRef[argumentCount];

  var function = LLVM.GetNamedFunction(this.module, node.Name);

  // If F conflicted, there was already something named 'Name'.  If it has a
  // body, don't allow redefinition or reextern.
  if (function.Pointer != IntPtr.Zero)
  {
    // If F already has a body, reject this.
    if (LLVM.CountBasicBlocks(function) != 0)
    {
      throw new Exception("redefinition of function.");
    }

    // If F took a different number of args, reject.
    if (LLVM.CountParams(function) != argumentCount)
    {
      throw new Exception("redefinition of function with different # args");
    }
  }
  else
  {
    for (int i = 0; i < argumentCount; ++i)
    {
      arguments[i] = LLVM.DoubleType();
    }

    function = LLVM.AddFunction(this.module, node.Name, LLVM.FunctionType(LLVM.DoubleType(), arguments, LLVMBoolFalse));
    LLVM.SetLinkage(function, LLVMLinkage.LLVMExternalLinkage);
  }
```

This code packs a lot of power into a few lines. Note first that this function creates a `LLVMTypeRef` instead of a `LLVMValueRef`. Because a `prototype` really talks about the external interface for a function (not the value computed by an expression), it makes sense for it to return the LLVM Function it corresponds to when codegen'd.

The call to `FunctionType` creates the `LLVMTypeRef` that should be used for a given Prototype. Since all function arguments in Kaleidoscope are of type double, the first line creates a vector of "N" LLVM double types. It then uses the `Functiontype` method to create a function type that takes "N" doubles as arguments, returns one double as a result, and that is not vararg (the false parameter indicates this).

The final line above actually creates the IR Function corresponding to the Prototype. This indicates the type, linkage and name to use, as well as which module to insert into. "external linkage" means that the function may be defined outside the current module and/or that it is callable by functions outside the module. The Name passed in is the name the user specified: since `module` is specified, this name is registered in `module`s symbol table.

```c#
  for (int i = 0; i < argumentCount; ++i)
  {
    string argumentName = node.Arguments[i];

    LLVMValueRef param = LLVM.GetParam(function, (uint)i);
    LLVM.SetValueName(param, argumentName);

    this.namedValues[argumentName] = param;
  }

  this.valueStack.Push(function);
  return node;
}
```

Finally, we set the name of each of the function's arguments according to the names given in the Prototype. This step isn't strictly necessary, but keeping the names consistent makes the IR more readable, and allows subsequent code to refer directly to the arguments for their names, rather than having to look up them up in the Prototype AST.

At this point we have a function prototype with no body. This is how LLVM IR represents function declarations. For extern statements in Kaleidoscope, this is as far as we need to go. For function definitions however, we need to codegen and attach a function body.

```c#
protected override ExprAST VisitFunctionAST(FunctionAST node)
{
  LLVMValueRef function = this.valueStack.Pop();
```

For function definitions, we start by searching module's symbol table for an existing version of this function, in case one has already been created using an `extern` statement. If `Module.GetNamedFunction` returns null reference (this happens in `VisitPrototypeAST`) then no previous version exists, so we'll codegen one from the Prototype. In either case, we want to assert that the function is empty (i.e. has no body yet) before we start.
In C\#, we use `this.valueStack.Pop()` directly.

```c#
  this.namedValues.Clear();

  this.Visit(node.Proto);

  // Create a new basic block to start insertion into.
  LLVM.PositionBuilderAtEnd(this.builder, LLVM.AppendBasicBlock(function, "entry"));

  try
  {
    this.Visit(node.Body);
  }
  catch (Exception)
  {
    LLVM.DeleteFunction(function);
    throw;
  }
```

Now we get to the point where the `builder` is set up. The 6th line creates a new basic block (named "entry"), which is inserted into `function`. Then it tells the builder that new instructions should be inserted into the end of the new basic block. Basic blocks in LLVM are an important part of functions that define the Control Flow Graph. Since we don't have any control flow, our functions will only contain one block at this point. We'll fix this in Chapter 5 :).

Next we add the function arguments to the `namedValues` map (after first clearing it out) so that they're accessible to `VariableExprAST` nodes.


```c#
  // Finish off the function.
  LLVM.BuildRet(this.builder, this.valueStack.Pop());

  // Validate the generated code, checking for consistency.
  LLVM.VerifyFunction(function, LLVMVerifierFailureAction.LLVMPrintMessageAction);

  this.valueStack.Push(function);

  return node;
}
```

Once the insertion point has been set up and the `namedValues` map populated, we call the `VisitChildren()` method for the root expression of the function.
If no error happens, this emits code to compute the expression into the entry block and returns the value that was computed.
Assuming no error, we then create an LLVM ret instruction, which completes the function. Once the function is built, we call `VerifyFunction`, which is provided by LLVM.
This function does a variety of consistency checks on the generated code, to determine if our compiler is doing everything right.
Using this is important: it can catch a lot of bugs.
Once the function is finished and validated, we return it.

```c#
LLVM.DeleteFunction(function);
```

The only piece left here is handling of the error case. For simplicity, we handle this by merely deleting the function we produced with the eraseFromParent method.
This allows the user to redefine a function that they incorrectly typed in before: if we didn't delete it, it would live in the symbol table, with a body, preventing future redefinition.

This code does have a bug, though: If the `VisitFunctionAST()` method finds an existing IR Function, it does not validate its signature against the definition's own prototype.
This means that an earlier `extern` declaration will take precedence over the function definition's signature, which can cause codegen to fail, for instance if the function arguments are named differently. There are a number of ways to fix this bug, see what you can come up with! Here is a testcase:

```python
extern foo(a); # ok, defines foo.
def foo(b) b;  # Error: Unknown variable name. (decl using 'a' takes precedence).
```

## 3.5. Driver Changes and Closing Thoughts

For now, code generation to LLVM doesn't really get us much, except that we can look at the pretty IR calls.
The sample code inserts calls to codegen into the `HandleDefinition`, `HandleExtern` etc functions, and then dumps out the LLVM IR. This gives a nice way to look at the LLVM IR for simple functions. For example:

```llvm
; ready> 4+5;
; Read top-level expression:
define double @0() {
entry:
  ret double 9.000000e+00
}
```

Note how the parser turns the top-level expression into anonymous functions for us. This will be handy when we add JIT support in the next chapter.
Also note that the code is very literally transcribed, no optimizations are being performed except simple constant folding done by `LLVMBuilderRef`. We will add optimizations explicitly in the next chapter.

```llvm
; ready> def foo(a b) a*a + 2*a*b + b*b;
; Read function definition:
define double @foo(double %a, double %b) {
entry:
  %multmp = fmul double %a, %a
  %multmp1 = fmul double 2.000000e+00, %a
  %multmp2 = fmul double %multmp1, %b
  %addtmp = fadd double %multmp, %multmp2
  %multmp3 = fmul double %b, %b
  %addtmp4 = fadd double %addtmp, %multmp3
  ret double %addtmp4
}
```

This shows some simple arithmetic. Notice the striking similarity to the LLVM builder calls that we use to create the instructions.

```llvm
; ready> def bar(a) foo(a, 4.0) + bar(31337);
; Read function definition:
define double @bar(double %a) {
entry:
  %calltmp = call double @foo(double %a, double 4.000000e+00)
  %calltmp1 = call double @bar(double 3.133700e+04)
  %addtmp = fadd double %calltmp, %calltmp1
  ret double %addtmp
}
```

This shows some function calls. Note that this function will take a long time to execute if you call it.
In the future we'll add conditional control flow to actually make recursion useful :).

```llvm
; ready> extern cos(x);
; Read extern:
declare double @cos(double)

; ready> cos(1.234);
; Read top-level expression:
define double @1() {
entry:
  %calltmp = call double @cos(double 1.234000e+00)
  ret double %calltmp
}
```

This shows an extern for the libm `cos` function, and a call to it.

```llvm
; ready> ^D
; ModuleID = 'my cool jit'

define double @0() {
entry:
  %addtmp = fadd double 4.000000e+00, 5.000000e+00
  ret double %addtmp
}

define double @foo(double %a, double %b) {
entry:
  %multmp = fmul double %a, %a
  %multmp1 = fmul double 2.000000e+00, %a
  %multmp2 = fmul double %multmp1, %b
  %addtmp = fadd double %multmp, %multmp2
  %multmp3 = fmul double %b, %b
  %addtmp4 = fadd double %addtmp, %multmp3
  ret double %addtmp4
}

define double @bar(double %a) {
entry:
  %calltmp = call double @foo(double %a, double 4.000000e+00)
  %calltmp1 = call double @bar(double 3.133700e+04)
  %addtmp = fadd double %calltmp, %calltmp1
  ret double %addtmp
}

declare double @cos(double)

define double @1() {
entry:
  %calltmp = call double @cos(double 1.234000e+00)
  ret double %calltmp
}
```

When you quit the current demo (by sending an EOF via <kbd>Ctrl</kbd>+<kbd>D</kbd> on Linux or <kbd>Ctrl</kbd>+<kbd>Z</kbd> and <kbd>Enter</kbd> on Windows), it dumps out the IR for the entire module generated. Here you can see the big picture with all the functions referencing each other.

This wraps up the third chapter of the Kaleidoscope tutorial.
Up next, we'll describe how to add JIT codegen and optimizer support to this so we can actually start running code!

## 3.6. Full Code Listing

[Here](https://github.com/Microsoft/LLVMSharp/blob/master/KaleidoscopeTutorial/Chapter3/KaleidoscopeLLVM/)
is the complete code listing for our running example, enhanced with the LLVM code generator.

[Next: Adding JIT and Optimizer Support](../CSharpLangImpl04)
