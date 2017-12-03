---
layout: post  
title: 树状数组离散化 
category: OI
tags: Misc, NOIP
keywords: NOIP, OI, algorithm
description: 这个世界到底怎么了
---

## 好气哦

前几天写一道树状数组离散化求逆序对的裸题，卡了我一天，气死我了。
网上搜出来的所谓的树状数组离散化的题解 or 教程，特么没一个是对的，全部都没考虑元素相同的情况，一开始我还想错了，真真是白白浪费了一天的时间！

所谓树状数组，就是树状的数组。首先你需要

$$
lowbit\ x := x\& (-x)
$$

然后基本操作有点插入和段查询，复杂度都是

$$
O(log\ n)
$$

，分别是两个递归的函数，`int sum(int)`和`void add(int, int)`。
大多数人写成非递归形式，我反正无所谓，我这水平也不会遇到卡常数的问题吧。

另外最常用的 lowbit ，很多人都写成函数，我喜欢使用宏定义：

```c
#define lowbit(x) ((x) & (-(x)))
```

宏定义才是真正的 inline (逃

通过这两个操作可以模拟段更新点求值，段更新只需`add(begin, value), add(end, -value)`，对应的点求值就是`sum(i) - sum(i - 1)`。

这是树状数组的两个最简单的模型，逆序对稍微复杂一点，还要修改 sum 函数，把递归上界的 n 从数据大小改成每个数据最大值。
具体讲解网上到处都是，搜索树状数组逆序对就能找出一堆答案，但是让我纠结的是，代码交到 CodeVS 4163 上去时全部都只能 AC 第二组数据，别的全部 WA 掉。答案也只有一丁点的差距。

经过我一天的研究(都怪我太菜)原因是他们的离散化写错了。

这是一个错误的离散化代码：

```c
#include <stdio.h>
#include <stdlib.h>
#define size 1000010
#define lowbit(x) ((x) & (-(x)))
int tree[size + 10], n, after_tree[size + 10];
typedef struct Node {
  int v, p;
} Node ;
Node a[size + 10];
int sum(int idx) { return idx >= 1 ? tree[idx] + sum(idx - lowbit(idx)) : 0; }

void add(int idx) { if (idx <= size) ++tree[idx], add(idx + lowbit(idx)); }

int cmp(const void *a, const void *b) { return ((Node *)a)->v > ((Node *)b)->v; }

int main(int argc, const char *argv[]) {
  int i, j;
  long long t = 0;
  scanf("%i", &n);
  for (i = 1; i <= n; ++i) scanf("%i", &a[i].v), a[i].p = i;
  qsort(a + 1, n, sizeof(Node), cmp);
  for (i = 1; i <= n; ++i) after_tree[a[i].p] = i;
  for (i = 1; i <= n; ++i) add(after_tree[i]), t += i - sum(after_tree[i]);
  printf("%lli", t);
  return 0;
}
```

求别吐槽压行，看不惯可以拷到本地整理。

这代码乍一看没有问题，但是这离散化是错的，它没有考虑元素相等的情况。
也就是说，如果我的数据是：

$$
4 \\
100\ 233\ 666\ 450
$$

那么离散化的结果就是：

$$
1\ 2\ 4\ 3
$$

效果很好有木有？但是如果数据有重复的话呢？

$$
4 \\
3\ 2\ 3\ 2
$$

结果就是：

$$
3\ 1\ 2\ 4
$$

事实上，正确的离散化结果是：

$$
2\ 1\ 2\ 1
$$

因此，需要在排序之后的循环中加一个相等的判断。

```c
for (j = i = 1; i <= n; ++i, ++j) {
	after_tree[a[i].p] = j;
	// notice
	if (j <= n && a[i].v == a[i + 1].v) --j;
}
```

这样就能正确离散化了，详见我[CodeVS 4163](https://github.com/ice1000/OI-codes/blob/master/codevs/4163.c)代码，这是[原题](https://www.codevs.cn/problem/4163)。

话说我搜出来的题解全部都是错的，难道是一个人发了个错的然后所有人都抄他的？果然是版权大国啊，天朝真牛逼。

手机写 Markdown 蛋疼的要死。。。

