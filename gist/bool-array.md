---
layout: gist
title: 位运算压缩的 Boolean 数组
---

+ [来源](https://github.com/icela/FriceEngine/blob/master/src/org/frice/utils/misc/BoolArray.kt)

``` kotlin
package org.frice.utils.misc

const val USHR = 6
const val MOD = 0b11_1111

class BoolArray(val length: Int, val longs: LongArray) {
  constructor(length: Int) : this(length, LongArray((length ushr USHR) + 1))

  operator fun get(index: Int): Boolean {
    if (index >= length) throw IndexOutOfBoundsException("Index $index is out of range!(size: $length)")
    return longs[index ushr USHR] and (0b1L shl (index and MOD) - 1) != 0L
  }

  operator fun set(index: Int, boolean: Boolean) {
    if (index >= length) throw IndexOutOfBoundsException("Index $index is out of range!(size: $length)")
    if (boolean) longs[index ushr USHR] = longs[index ushr USHR] or (0b1L shl (index and MOD) - 1)
    else longs[index ushr USHR] = longs[index ushr USHR] and (0b1L shl (index and MOD) - 1).inv()
  }
}
```
