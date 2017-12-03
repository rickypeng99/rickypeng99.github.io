---
layout: post
title: 简单粗暴的地图生成
category: Tools
tags: Misc
keywords: Kotlin
description: Very simple map gengeration
---

这是我大概几个星期前随便写的小玩意，看到一票人都在玩这个，就自己也整了个来玩。

## 使用的技术

+ Kotlin
原因：我只会这个

写了这个之后我才发现 Kotlin 的这个语法真的是超级适合写这种小玩意。

## 工作流程

0. 随机生成点
0. 扩大 (doublify)
0. 一定概率下两两相连，扩大连线，形成主大陆
0. 匀一下 (averagify)
0. 再随机生成点
0. 再匀一下 (averagify8)
0. 扩大 (triplify)
0. 根据等高线画出地形图，特定高度随机生成裸露岩石灰色
0. 生成几个点，根据水往低处流的特点用 A\* 走一遍生成河流
0. 在特定高度随机生成黄点，可以看作是南瓜或者城市
0. 在海边走一遍 bfs 生成大小有限的沙滩 (这部分耗时比较严重，可我真的不知道怎么优化那个 bfs 了)

是不是很简单呢。比 Nova 的那个简单多了。这个只适合生成一个孤立的小岛， Nova 那个是一个大陆啊。而且自然得多。

## 效果

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/a.png)

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/b.png)

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/c.png)

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/d.png)

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/e.png)

## 演化史

从最原始的版本越来越新。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/01.png)

一开始啥都没有，画质也很低，连线是 100%。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/02.png)

连线改成概率。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/03.png)

增加沙滩，这时沙滩不是 bfs 出来的，是等高线的一部分。这张生成的很狰狞，我很喜欢，不过这时代码的 averagify 逻辑有点问题。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/04.png)

这时这个 bug 很明显。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/05.png)

bug 修复。改变配色方案（之前是随手写的颜色代码，后来改成了 flutter 里面拿出来的 Material Design 的颜色）。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/06.png)

改进颜色层次。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/07.png)

改变地图大小，趋近于现在的大小，增加主大陆外的小岛。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/08.png)

没变。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/09.png)

增加每次评估四个点的 A\* 算出来的河流。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/10.png)

这个也比较好玩，刚好有一大段卡进沙滩的范围。河流的 A\* 改成评估八个点。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/11.png)

改变了一些参数。其实没咋变，这张生成的比较特异而已。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/12.png)

增加河流流到内陆中央盆地会生成小湖，只是这时写的超傻逼。另外河流数量过剩了。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/13.png)

改进前面说的小湖，能看了。河流数量似乎还是那样。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/14.png)

减少河流。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/15.png)

进一步减少河流。现在稍微好点了。取消基于等高线的沙滩。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/16.png)

沙滩改为 bfs 。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/16/collections/17.png)

增加\[城市/南瓜\]。

## 主要逻辑部分

+ 源码在 GitHub [ice1000/map-gen](https://github.com/ice1000/map-gen)

```kotlin
fun main(vararg args: String) {
  /// the first map
  val map1 = gameMapOf(60, 60)
  val ls = map1.genRandPts(11)

  /// initial points
  map1 {
    ls.forEach { (x, y, i) ->
      val v = rand(200) + 1000 + i * (MAGIC_NUM_1 / ls.size)
      Pair(x, y).pnd.forEach { p ->
        set(p.first, p.second, v + rand(100) - 50)
        p.pnd.forEach { (x, y) -> set(x, y, v + rand(100) - 50) }
      }
      set(x, y, v)
    }
  }

  ls eachTwo { (x1, y1, _), (x2, y2, _) ->
    if (rand(5) >= 2) {
      map1 {
        val k = (map1[x1, y1] + map1[x2, y2]) shr 1
        Line(Point(x1, y1), Point(x2, y2)).allPoints.forEach { (x, y) ->
          70 % { map1[x, y] = k + rand(200) - 100 }
          Point(x, y).pnd.forEach { 70 % { map1[it] = k + rand(200) - 100 } }
        }
      }
    }
  }

  /// random points
  repeat(100) {
    val x = rand(map1.width - 2) + 1
    val y = rand(map1.height - 2) + 1
    map1[x, y] = rand(300) + 300
  }

  repeat(3) { map1.averagify() }
  /// expand the size, the second map
  val map2 = map1.doublify()
  /// traverse and add random points
  map2.traverse { (x, y, i) -> map2[x, y] = rand(200) - 50 + i }
  /// random points, as islands
  val ls2 = map2.genRandPts(9)
  map2 {
    ls2.forEach { (x, y, i) ->
      val v = rand(800) + 200 + i * (MAGIC_NUM_1 / ls2.size)
      Pair(x, y).pnd.forEach { p ->
        set(p.first, p.second, v + rand(100) - 50)
        p.pnd.forEach { (x, y) -> set(x, y, v + rand(100) - 50) }
      }
      set(x, y, v)
    }
  }

  /// expand the map size, the final map
  map2.averagify8().averagify()
  val map3 = map2.triplify()
  map3.averagify8().averagify().averagify()
  /// now the map is ready
  /// rivers(based on A* algorithm)
  repeat(rand(4, 6)) { map3.rivers.add(map3.genRiver()) }
  map3.generateImage(args.getOrElse(0, { "out.png" }))
}
```

这样主大陆就好了。这部分代码所用到的框架我觉得可以提炼出来作为一个图形库，嘿嘿。

## 绘制部分

这部分负责绘制，以及走 A\* 形成河流，还有黄色点点。

```kotlin
fun GameMap.generateImage(fileName: String) {
  image(width, height) {
    traverse { (x, y, i) ->
      color(x, y, when (i) {
        in -10000..300 -> DEEP_BLUE
        in 0..500 -> BLUE
        in 0..900 -> SHALLOW_BLUE
        in 0..1200 -> MIDDLE_GREEN
        in 0..1400 -> L_LIGHT_GREEN
        in 0..1600 -> LIGHT_GREEN
        in 0..1700 -> DARK_GREEN
        in 0..1900 -> M_DARK_GREEN
        in 0..2070 -> if (1 == rand(72)) GRAY else BROWN
        else -> if (1 == rand(24)) GRAY else WHITE
      })
    }
    val rg = 801..960
    fun bfs(p: Point, block: (Point) -> List<Point>) {
      val q: Queue<Point> = LinkedList<Point>()
      q.offer(p)
      var i = 0
      while (q.isNotEmpty() && ++i < 50000) {
        if (contains(q.peek()) && colorOf(q.peek()) != SAND && get(q.peek()) in rg) {
          block(q.peek()).filter { it !in q && get(it) in rg }.forEach {
            q.offer(it)
            color(it, SAND)
          }
        }
        q.poll()
      }
    }

    val i = rand(10, width - 10)
    var j = 0
    while (j < height && get(i, j) !in rg) ++j
    bfs(Point(i, j), { it.pndL })
    bfs(Point(i, j), { it.pndR })
    /// pumpkins
    repeat(6) {
      genRandPtSatisfying { get(it) in 1151..1450 }.pnd9.forEach { color(it, ORANGE) }
    }
    rivers.forEach { it.flatMap { it.pnd5 }.forEach { color(it, SHALLOW_BLUE) } }
    write(fileName)
  }
}

```

