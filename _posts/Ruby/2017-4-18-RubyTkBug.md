---
layout: post  
title: 突然经历好几个第一次
category: Ruby
tags: Ruby
keywords: ruby, ruby/tk, tk, stackoverflow
description: first stackoverflow answer
---

第一次在 StackOverflow 上回答问题，第一次凭借自己的力量修复某语言标准库的 bug ，第一次给那么重量级的仓库投 pull request...

## 后来的补充

Tk 维护者[告诉我](https://github.com/ruby/tk/pull/8)那个 bug 是已经修复了的（在另一个地方处理了空指针），
只不过修复发生在 Ruby/Tk 2.3 发布之后。

你可以通过 gem 'tk'来获得更新后的修复了这个 bug 的版本。

不过我在[StackOverflow](http://stackoverflow.com/questions/43011258/ruby-tks-canvas-and-shapes-are-bugging-out/)
上给的解法是适用的，不想更新的话就可以用我的解法。

## 又发生什么了

就是在湛兮同学用我的[FriceEngine-Ruby](https://github.com/icela/FriceEngine-Ruby)的时候遇到了一个问题：

```
D:/Ruby23-x64/lib/ruby/2.3.0/tk/itemconfig.rb:115:in `hash_kv': wrong argument type nil (expected Array) (TypeError)
        from D:/Ruby23-x64/lib/ruby/2.3.0/tk/itemconfig.rb:115:in `itemconfig_hash_kv'
        from D:/Ruby23-x64/lib/ruby/2.3.0/tk/canvas.rb:722:in `_parse_create_args'
        from D:/Ruby23-x64/lib/ruby/2.3.0/tk/canvas.rb:735:in `create'
        from D:/Ruby23-x64/lib/ruby/2.3.0/tk/canvas.rb:758:in `create_self'
        from D:/Ruby23-x64/lib/ruby/2.3.0/tk/canvas.rb:751:in `initialize'
        from D:/git-repos/FriceEngine-Ruby/src/engine.rb:170:in `new'
        from D:/git-repos/FriceEngine-Ruby/src/engine.rb:170:in `clear_screen'
        from D:/git-repos/FriceEngine-Ruby/src/engine.rb:132:in `draw_everything'
        from D:/git-repos/FriceEngine-Ruby/src/engine.rb:78:in `initialize'
        from test3.rb:15:in `new'
        from test3.rb:15:in `<main>'
```

问题出在这个地方：

```ruby
TkcRectangle.new @canvas, 0, 0,
                  @game_bounds[2],
                  @game_bounds[3],
                  'fill' => 'white'
```

然后我仔细阅读了 StackTrace ，发现不是我的引擎的问题（废话，我早就在 Ruby2.1 下测试过了），
是[Ruby Tk 库](https://github.com/ruby/tk)的问题。

位于源码的这个位置：

```ruby
#...
#... 省略
#...
  def itemconfig_hash_kv(id, keys, enc_mode = nil, conf = nil)
    hash_kv(__conv_item_keyonly_opts(id, keys), enc_mode, conf)
  end
#...
#... 省略
#...
```

也就是说， Ruby2.3 发布了有 bug 的代码。

但是我又不熟悉标准库的源码，于是就去股沟搜，发现了一个超过分的行为。

我看到[那个 bugs 的帖子](https://bugs.ruby-lang.org/issues/12156)。

楼主留了详细的信息。然后二楼是个系统消息，维护者被 assign 到这个 bug ，然后 4 个月后，维护者 rejected。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/12/0.png)

这什么意思。。话都不说一句就给 rejected 了。。。

而且[StackOverflow 上也有相应的问题](http://stackoverflow.com/questions/43011258/ruby-tks-canvas-and-shapes-are-bugging-out/)，
但是却没有一个回答。

于是我就去阅读了 StackTrace ，然后尝试修复它——**直接改标准库源码**。

我是不是胆子很大\~

**然后就跑过了。**<br/>
**然后就跑过了。**<br/>
**然后就跑过了。**<br/>
**然后就跑过了。**<br/>
**然后就跑过了。**<br/>
**然后就跑过了。**<br/>

然后我就把标准库里面的代码改回来了，在引擎前面加了句这个，

```ruby
module TkItemConfigOptkeys
  def itemconfig_hash_kv(id, keys, enc_mode = [], conf = [])
    hash_kv(__conv_item_keyonly_opts(id, keys), enc_mode, conf)
  end
end
```

程序运行没有任何问题。

用了 Ruby 才知道打开 class/module 的好处啊（逃

所以说，要么就动态到极致，要么就静态~~，像某些语言，不仅元编程不行，语义还依赖于缩进，还要不要好好写代码了~~。

紧接着我回到刚才 StackOverflow 那个问题，写了个[回答](http://stackoverflow.com/questions/43011258/ruby-tks-canvas-and-shapes-are-bugging-out/43476737#43476737)
。

最后我在 GitHub 上找到了对应的代码，修改了这个 bug ，并提交了[一个 pull request](https://github.com/ruby/tk/pull/8)。
虽然只改了一行代码，但是却从不能运行变成了可以运行，这还是很好的。

不知道远在岛国的 Ruby contributor 会不会 merge 呢。。。。

顺便晒一下刚刚修复 bug 之后跑通的 Demo ，可以做到显示 gif 格式的静态图片（ Tk 库），
以及文字，几何图形，和简单的动画。

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/12/1.png)

实现也就短短 40 行 Ruby 代码：

```ruby
require_relative '../src/engine'

class Demo < Game
  def on_init
    @shit = 0
    title 'boy next door'
    size 500, 500
    # @ass = FObject.new
    # @ass.add_anim 233
    add_object FLine.new(5, 5, 100, 100)
  end

  def on_last_init
    # TkcLine.new(@canvas, 5, 5, 100, 100, 'fill' => 'blue', 'width' => 2)
    # message_box 'ah', 'ass we can'
    shape = ShapeObject.new('rect', 1, 1, 100, 100)
    shape.color = 'red'
    image = ImageResource.from_file 'fork_you.gif'
    images = []
    (0..8).each do |i|
      images[i] = ImageResource.from_file "#{i}.gif"
      add_object(ImageObject.new images[i], (i % 4) * 100 + 150, (i / 4) * 100 + 150)
    end
    image_o = ImageObject.new image, 300, 400
    add_object shape
    add_object image_o
    add_object SimpleText.new(200, 200, 'Ah I\'m fucking coming, this is the demo for FriceEngine-Ruby.', 'purple')
  end

  def on_refresh
    @shit += 3
    test_add
  end

  def test_add
    add_object FLine.new(0 + @shit, 5, 100, 100)
  end
end

Demo.new
```

