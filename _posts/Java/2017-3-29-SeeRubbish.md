---
layout: post
title: 最近看到很多不可描述的代码
category: Java
tags: Java
keywords: Java,Hadoop
description: Really Bad Codes
---

## 为什么说这些代码不可描述呢

+ 代码风格糟糕
+ 犯极其愚蠢的错误
+ 无厘头

## 为什么我要在我的博客发这种烂大街的东西

+ 因为我都是实实在在找到的代码
+ 不是知乎上面那种自己编的

## 代码一

看[这篇博客](http://blog.sina.com.cn/s/blog_adf4f4d90101ht8v.html)，

翻到方法二，看这里：

```java
tree.setCellRenderer(new IconNodeRenderer()); // 设置单元格描述
DefaultTreeCellRenderer cellRenderer = (DefaultTreeCellRenderer) tree
.getCellRenderer();// 获取该树的 Renderer
```

什么仇什么怨，为什么在代码里面下毒？

## 代码二

依然是上面那篇博客：

```java
IconNode Root = new IconNode(null, null);// 定义根节点
Root.add(root1);// 定义二级节点
Root.add(root2);// 定义二级节点
```

也是厉害了

## 代码三

![drug](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/6/0.png)

我要不行了。。


话说为什么我在写插件的过程中突然跑过来看这个？因为我想把 Lice 的 AST Viewer 嵌入插件中。

正在做，敬请期待。


