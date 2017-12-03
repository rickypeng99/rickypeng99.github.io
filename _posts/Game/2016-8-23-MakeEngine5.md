---
layout: post
title: 轮子狂魔造引擎 第五章
category: Game
tags: Java, Game, Engine
keywords: Java,Game,Engine
description: make a game engine chapter 5
---

很久没发文章了，我觉得应该勤奋一点。。。嚯呀。。

## 到底讲啥

这里我说一个，呃，对于第一次造引擎的人来说比较坑的事情吧。那就是碰撞事件的处理。

碰撞事件的处理和回调是游戏引擎帮你做的一件非常重要的事情，是游戏引擎的核心功能之一。寒冰是在第四天才有了碰撞处理的（这个引擎目前已经停止大规模开发，进入维护阶段。我也不知道我那**五天写 7k 行删 3k 行**这种一看就知道是打字机一般的速度（我只有晚上可以写引擎，那几天白天都在刷题啊喂）究竟会造出怎样的 bug。反正停止了疯狂写码的状态之后就开始进入维护模式，顺便踩点巨坑什么的。）

## 我之前的思路

由于我在造引擎的时候只用过[JustWeEngine](https://github.com/lfkdsk/JustWeEngine)一个引擎，所以我一开始的思路是想参考 JustWeEngine 的碰撞回调方式，那就是设置生命周期方法，传入参数，当碰撞发生时将碰撞事件相关信息（肇事者，受害人等）传入，然后开发者在这个方法里面处理碰撞事件。代码写出来大概就是这样（摘自[JustWe 的 Demo](https://github.com/lfkdsk/EngineDemo)）：

```java
@Override
public void collision(BaseSub baseSub) {
    BaseSprite other = (BaseSprite) baseSub.getOffender();
    if (baseSub.getIdentifier() == BULLET &&
            other.getIdentifier() == ENEMY) {
        other.setAlive(false);
        removeFromSpriteGroup(other);
        addToRecycleGroup(other);
        enemyNum--;
    }
}
```

然后我当时就想模仿。后来发现 Unity 貌似也是这样弄的诶，代码写出来大概是这样（别吐槽了我才学两天，命名是 Project Rider 建议出来的）：

```csharp
public void OnTriggerEnter(Collider c)
{
  if (c.tag.Equals("Food"))
  {
    Destroy(c.gameObject);
    _score++;
    ShowScore();
  }
}
```

然后我仔细想了想。如果我是要做成生命周期的形式的话，那我也不知道开发者想要具体监听哪两个物体的碰撞，也就是说我必须检测所有的物体，两两相检测，然后再根据碰撞情况传入，我掐指一算， O(n^2)。。。吓得我瓜子都掉地上了。我这个 OI 学渣立刻对这种不好的处理方式感到一阵畏惧，不禁躲到了墙角（雾）。

为了写专栏我还专门去阅读了 JustWeEngine 的源码。因为当初我使用 JustWeEngine 的时候还是个懵懂无知的少年，对于阅读开源项目的源码一直是充满了抵触情绪的（说白了就是懒，组织大量代码能力不足），现在我专门去看了下丰恺学长的源码，妄想着能看到什么优化的奇技淫巧，或者是黑科技。

**结果。他真的是写了个 O(n^2)的遍历。。。。**

好吧我虽然明白了这样遍历是可行的（毕竟我之前写了个[基于 JustWeEngine 的打飞机](https://github.com/icela/StudioVSEclipse)，满屏的子弹飞来飞去碰撞检测也没有任何问题。如下图。

![](https://github.com/icela/StudioVSEclipse/raw/master/1.png)

但是我内心还是不希望写成 O(n^2)的。而且如果是放在生命周期方法里面，会出现一个巨大的 Switch 或者一长串 if else if else。。。
我个人非常厌恶这样的代码。

## 我用在引擎里的思路

于是我想了个办法——就是指定地监听。指定你需要监听的对象，然后引擎只负责处理你指定的那几组对象。
这样减少了大量的无用的回调（如果是每两个物体都处理一次，那么大多数回调是不会发生任何事的）。我当时就觉得这是极好的。
于是我就这么组织代码了：

首先在 `FObject` 基类里面弄一个列表，里面放所有的要检测的碰撞对象和碰撞事件（ `PhysicalObject` 是可以进行碰撞处理的对象，
`OnCollideEvent` 是一个接口，里面是碰撞发生时所应该回调的方法）：

```swift 
val targets = ArrayList<Pair<PhysicalObject, OnCollideEvent>>()
```

然后在 Game 类每次刷新的时候遍历所有的 `object` ，针对每一个 `object` 分别对 `targets` 进行 `forEach` ，
如果碰撞那么调用 `OnCollideEvent` 接口提供的方法。（ `isDied` 是在我的一个简易手动 GC 里面用的，以后再说）

虽然这个理论上还是 O(n^2)，但是完全把那些不必要的回调省了好嘛！一般也就几个监听，我就只调用了那几个监听啊！

```swift
fun checkCollision() {
  targets.removeIf { t -> t.first.died }
  targets.forEach { t -> if (isCollide(t.first)) t.second.handle() }
}
```

至于 `isCollide` 方法（第二个 `forEach` ）的实现，又是另外一回事了。。

## isCollide 的实现

这是一个数学问题。首先我这是一个简陋的引擎，我短期内不会去支持像素级的碰撞检测（说实话这个在数学上其实也不难，
我感觉就是个优化和性能问题），目前就只做了矩形和矩形的碰撞，椭圆相关的还是 TODO 状态（逃

大概就是这样，非常简单：

```swift
protected infix fun PhysicalObject.rectCollideRect(rect: PhysicalObject) =
    x + width >= rect.x && rect.y <= y + height &&
        x <= rect.x + rect.width &&
        y <= rect.y + rect.height
```

嘛，就这样啦。欢迎围观[寒冰引擎](https://github.com/icela/FriceEngine)，求 star 求 follow ！ QwQ
