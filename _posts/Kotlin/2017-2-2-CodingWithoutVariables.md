---
layout: post
title: 写代码不用变量 Kotlin
category: Kotlin
tags: Essay
keywords: Kotlin
description: Kotlin without variables
issue_id: 4
---

说到写代码，一般人都是会使用变量的。比如说：

```java
public class Java {
  public static void main(String[] args) {
    try {
      final JFrame frame = new JFrame("BoyNextDoor");
      final BufferedImage image = ImageIO.read(new URL("http://ice1000.org/assets/img/avatar.jpg"));
      frame.setLayout(new BorderLayout());
      frame.add(new JPanel() {
        @Override
        protected void paintComponent(Graphics g) {
          super.paintComponent(g);
          if (g != null) g.drawImage(image, 0, 0, this);
        }
      }, BorderLayout.CENTER);
      frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
      frame.setSize(image.getWidth(), image.getHeight());
      frame.setVisible(true);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
```


其实如果你熟悉 Kotlin 的话，是不需要使用变量的。那么我们来看看咋写。


先回顾上面的代码，我们使用了两个变量，一个是 JFrame 的实例，一个是 BufferedImage 的实例。 JFrame 声明变量是因为要对它进行多次操作（ add ，还有 setSize 等）， BufferedImage 声明变量是因为不仅仅要 drawImage ，还要 getHeight getWidth 。

那么我们就任性一把，不声明一个变量：

```kotlin
fun main(args: Array<String>) {
  JFrame("BoyNextDoor2").run {
    layout = BorderLayout()
    add(object : JPanel() {
      override fun paintComponent(g: Graphics?) {
        super.paintComponent(g)
        g?.drawImage(ImageIO.read(URL("https://avatars0.githubusercontent.com/u/16398479"))
            .apply { this@run.setSize(width, height) }, 0, 0, this)
      }
    }, BorderLayout.CENTER)
    defaultCloseOperation = WindowConstants.EXIT_ON_CLOSE
    isVisible = true
  }
}
```

看到没，我一个变量没使用，靠范型扩展（而且是标准库自带的范型扩展， Standard.kt 里面的）搞定了原本需要声明变量的地方。我觉得这是 Kotlin 很优雅的一个地方。

至于范型扩展是啥，请看我[这篇博客](../../../../2016/10/17/LearnKotlin7/)，或者看这篇博客在[知乎专栏的转载](https://zhuanlan.zhihu.com/p/23071063)。

再者， Kotlin 摆脱了 Checked Exception 的魔咒。我再举个例子，我昨天在 JavaCodeGeeks 上面看到的教程里面是这么写 Hadoop 的 MapReduce 的：

```java
public class MapClass extends Mapper<LongWritable, Text, Text, IntWritable> {

  private final static IntWritable one = new IntWritable(1);
  private Text word = new Text();

  @Override
  protected void map(LongWritable key, Text value,
      Context context)
      throws IOException, InterruptedException {
    
    String line = value.toString();
    StringTokenizer st = new StringTokenizer(line," ");
    
    while(st.hasMoreTokens()){
      word.set(st.nextToken());
      context.write(word,one);
    }
    
  }
}
```

我拿 Kotlin 的 fp 特性开了个挂，写了超短的对应的 Kotlin 代码，没有声明一个变量：

```kotlin
class MapClass : Mapper<LongWritable, Text, Text, IntWritable>() {
  val word = Text()
  val one = IntWritable(1)

  override fun map(
      key: LongWritable?,
      value: Text?,
      context: Context?) {
    value!!.toString().split(" ").forEach { str ->
      context?.write(word.apply { set(str) }, one)
    }
  }
}
```

这是他给的 Reduce 代码：

```java
public class ReduceClass extends Reducer {

  @Override
  protected void reduce(Text key, Iterable values,
      Context context)
      throws IOException, InterruptedException {

    int sum = 0;
    Iterator valuesIt = values.iterator();

    while(valuesIt.hasNext()){
      sum = sum + valuesIt.next().get();
    }

    context.write(key, new IntWritable(sum));
  }
}
```

我继续使用 Kotlin 的 fp 和范型扩展开挂，不声明变量，比他那个少了很多很多：

```kotlin
class ReduceClass : Reducer<Text, IntWritable, Text, IntWritable>() {
  override fun reduce(
      key: Text?,
      values: MutableIterable<IntWritable>?,
      context: Context?) {
    context?.write(key, IntWritable(values?.fold(0) { sum, int -> sum + int.get() } ?: 0))
  }
}
```

最后这是他给出的 Worker 类，用来执行整个业务逻辑的，可以看到这里声明了很多变量，而且这些变量是不可避免的：

```java
public class WordCount extends Configured implements Tool{

  public static void main(String[] args) throws Exception{
    int exitCode = ToolRunner.run(new WordCount(), args);
    System.exit(exitCode);
  }

  public int run(String[] args) throws Exception {
    if (args.length != 2) {
      System.err.printf("Usage: %s needs two arguments, input and output 
files\n", getClass().getSimpleName());
      return -1;
    }

    Job job = new Job();
    job.setJarByClass(WordCount.class);
    job.setJobName("WordCounter");

    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]));

    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(IntWritable.class);
    job.setOutputFormatClass(TextOutputFormat.class);

    job.setMapperClass(MapClass.class);
    job.setReducerClass(ReduceClass.class);

    int returnValue = job.waitForCompletion(true) ? 0:1;

    if(job.isSuccessful()) {
      System.out.println("Job was successful");
    } else if(!job.isSuccessful()) {
      System.out.println("Job was not successful");
    }

    return returnValue;
  }
}
```

但是 Kotlin 就可以完全避免：

```kotlin
class WordCounter : Configured(), Tool {
  override fun run(args: Array<out String>?): Int {
    args?.let {
      if (args.size != 2) {
        println("fuck you!")
        return -1
      }
      Job().apply {
        setJarByClass(WordCounter::class.java)
        jobName = "WordCounter"
        FileInputFormat.addInputPath(this@apply, Path(args[0]))
        FileOutputFormat.setOutputPath(this@apply, Path(args[1]))
        outputKeyClass = Text::class.java
        outputValueClass = IntWritable::class.java
        outputFormatClass = FileOutputFormat::class.java
        mapperClass = MapClass::class.java
        reducerClass = ReduceClass::class.java
        waitForCompletion(true).run {
          if (isSuccessful) println("success!") else println("failed!")
          return if (this) 0 else 1
        }
      }
    }
    return -2
  }

}

fun main(args: Array<String>) = System.exit(ToolRunner.run(WordCounter(), args))
```


而且原文贴的代码充满了行末空格和 Tab ，猥琐死了，果然 Eclipse 写的东西就是辣鸡。

希望以上的例子能使您心中的 Kotlin 变得有几分高大上。

## 总结

+ Kotlin 写这种搬砖式代码是不需要声明变量的
+ 哪怕是一点点 fp 支持，在这种生产环境也非常好用
+ 写 OOP 可能做不到零变量，因为你需要声明 field 和 property

## 教练我想学 Kotlin

+ 官网教程： [https://kotlinlang.org/docs/reference/](https://kotlinlang.org/docs/reference/)
+ GitHub 上的中文教程： [http://kotlindoc.com/](http://kotlindoc.com/)
+ 我本来想写的，但是发现写零基础教程对我来说考验太大了，还是省省吧，就我这菜鸡还写啥教程

## 最后祝你

身体健康


