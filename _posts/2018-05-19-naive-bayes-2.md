---
layout: posts
title: 利用Naive Bayes（朴素贝叶斯）实现手写数字识别 - 代码实现篇
tags:
- Academic
- Chinese
- Machine learning
mathjax: true
mathjax_autoNumber: true
---
## 1. 导言
### 1.1 程序基本结构
本文所展示的代码均由C++写成。这个示例程序的结构很简单，无非是5个cpp文件和一个头文件组成。  
```bash
├── Classification.cpp
├── Evaluation.cpp
├── ImageData.cpp
├── ImageData.h
└── Probability.cpp
```  
- Classfication.cpp 文件包含了对手写数字进行分类的函数。  
- Evaluation.cpp 文件包含了对后验概率数据进行分析的函数。  
- ImageData.cpp 文件包含了对原始图片的信息进行提取以及处理的函数。  
- Probability.cpp 文件包含了根据处理后的图形数据进行概率建模的函数。  

### 1.2 
