---
layout: gist
title: 证明 A + B = B + A
---

```agda
module A+B where

open import Data.List
open import Data.Nat
open import Agda.Builtin.Equality

a+0=0+a : ∀ a → a + 0 ≡ a
a+0=0+a  zero   = refl
a+0=0+a (suc a) rewrite a+0=0+a a = refl

++a+b=a+b++ : ∀ a b → suc a + b ≡ a + suc b
++a+b=a+b++  zero   b = refl
++a+b=a+b++ (suc a) b rewrite ++a+b=a+b++ a b = refl

a+b=b+a : ∀ a b → a + b ≡ b + a
a+b=b+a  zero zero   = refl
a+b=b+a  zero b
  rewrite a+0=0+a b
          = refl
a+b=b+a (suc a) b
  rewrite a+b=b+a a b
        | ++a+b=a+b++ b a
          = refl
```
