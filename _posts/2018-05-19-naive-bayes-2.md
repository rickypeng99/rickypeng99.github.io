---
layout: post
key: 20180519
title: 利用Naive Bayes（朴素贝叶斯）实现手写数字识别 - 代码实现篇
tags:
- Academic
- Chinese
- Machine learning
mathjax: true
mathjax_autoNumber: true
---
## 1. 导言  
本文所使用的源代码位于[这里](https://github.com/rickypeng99/naiveBayesClassifier)。

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
<!--more-->
## 2. 处理手写数字图片
### 2.1 提取28x28的手写数字像素图
如下段代码块所示，这个函数的主要目的就是读取图形文件（图形的原样可以在理论实现篇里查看），然后将原始图片给处理为只有0和1的数据图（1为黑和灰，0为白），视为一个ImageData对象。之后将所有的数据图给传到一个vector里。  
{% highlight c++ linenos %}
void readingImages(vector<ImageData>& trainingData, string fileName) {
    ifstream inFile;
    inFile.open("../data/" + fileName);
    string line;
    int count = 0;
    ImageData imageData{};


    while (getline(inFile, line)) {
            for (unsigned long i = 0; i < IMAGE_SIZE; i++) {
                imageData.Image[count][i] = transferBool(line.at(i));
            }

            count++;

            if (count == IMAGE_SIZE) {
                //create a temporary imageData to save current value
                ImageData temp = imageData;
                //put the temp into the vector
                trainingData.push_back(temp);
                //clear the memory of image array
                memset(imageData.Image, 0, sizeof(imageData.Image));

            }
        }


}
{% endhighlight %}  
## 2. 训练
### 2.1 先验概率
如理论实现篇所示，Naive Bayes中，先验概率即为在训练集中，每个数字类别占总量的多少。因此，代码实现只需要简单两步：数每个数字类别有多少个，以及计算他们出现的概率。（这个太简单就不需要贴代码了吧）

### 2.2 经验概率 - 统计次数
在为每一个feature（像素点）计算概率之前，我们首先应该进行统计。过程通俗点讲即为：在F1,2的时候，当像素点的值为0（白色），成为数字类别『1』有多少次？  
{% highlight c++ linenos %}
void addStatisticToProbability(Model& model, const vector<int> &labels, const vector<ImageData> &trainingData) {
    auto sizeOfLabels = static_cast<int>(labels.size());
    auto sizeOfTraining = static_cast<int>(trainingData.size());
    if (sizeOfLabels != sizeOfTraining) {
        cout << "The label file doesn't match the image file, I CAN'T BE TRAINED";
        exit(0);
    }

    //Initialize the array (preventing a strange array bug)
    for (int num = 0; num < CLASS_NUM; num++) {
        for (int width = 0; width < IMAGE_SIZE; width++) {
            for (int height = 0; height < IMAGE_SIZE; height++) {
                for (int binary = 0; binary < 2; binary++) {
                    model.probabilities[width][height][num][binary] = 0;
                }
            }
        }
    }
    for (unsigned long pos = 0; pos < trainingData.size(); pos++) {
        ImageData currentImage = trainingData.at((pos));
        for (int i = 0; i < IMAGE_SIZE; i++) {
            for (int j = 0; j < IMAGE_SIZE; j++) {
                bool currentBoolean = currentImage.Image[i][j];
                model.probabilities[i][j][labels[pos]][currentBoolean]++;

            }
        }
    }
}
{% endhighlight %}  

### 2.3 经验概率 - 构建模型与保存
如上面所示，我们在统计次数的过程中已经将一个四维数组构建好了，因次，我们只需要遍历这个数组，然后把统计的数据换成计算后的概率即可。 注：其中的K为拉普拉斯平滑所用的常量。  
{% highlight c++ linenos %}
void makeProbability(Model& model, const int arr[10]) {


    for (int width = 0; width < IMAGE_SIZE; width++) {
        for (int height = 0; height < IMAGE_SIZE; height++) {
            for (int num = 0; num < CLASS_NUM; num++) {
                for (int binary = 0; binary < BINARY; binary++) {
                    double temp = model.probabilities[width][height][num][binary];
                    model.probabilities[width][height][num][binary] =
                            (K + temp) / (double)(K + K + arr[num]);
                }
            }
        }
    }

}
{% endhighlight %}  
我们接下来应该把这些数据给输出到另一个文档里面，以便后续的使用（以后就不需要重新训练了，虽然5000个28x28大小的图片训练起来也蛮快的）。  
{% highlight c++ linenos %}
bool Model::saveToFile() {

    ofstream saveFile("../data/model.txt");
    if (!saveFile) {
        return false;
    }

    for (int num = 0; num < CLASS_NUM; num++) {
        for (int width = 0; width < IMAGE_SIZE; width++) {
            for (int height = 0; height < IMAGE_SIZE; height++) {
                for (int binary = 0; binary < 2; binary++) {
                    saveFile << setw(12) << probabilities[width][height][num][binary] << setw(12);
                }
            }
            saveFile << endl;
        }
        saveFile << endl;
    }
    saveFile.close();
    return true;
}  
{% endhighlight %}  
一个正确的模型构建应该类似于下图（当拉普拉斯平滑常量K = 1的时候，下图只是很小的一部分）：  
{% highlight Markdown linenos %}
0.997921 0.002079 0.997921 0.002079 0.997921 0.002079  
0.997921 0.002079 0.997921 0.002079 0.997932 0.002079  
0.997921 0.002079 0.997921 0.002079 0.997932 0.002079  
0.997921 0.002079 0.997921 0.002079 0.997932 0.002079      
{% endhighlight %}  


## 3. 分类  
### 3.1 读取经验概率模型
分类的第一步便是要先读取上文所构建出来的模型。**注：读取只需要在没有训练的时候才需要读取模型。如果训练后直接开始分类是不需要读取的。**  
{% highlight c++ linenos %}
bool Model::loadFromFile() {
    double data = 0.0;
    int i = 0;
    int j = 0;
    int classNum = 0;
    int binary = 0;

    string fileName;
    cin >> fileName;

    ifstream inFile("../data/" + fileName);

    if (!inFile.is_open()) {
        cout << "The file is not existed! Please input the correct name" <<endl;
        exit(0);

    }

    while(inFile >> data) {
        probabilities[i][j][classNum][binary] = data;
        binary++;
        if (binary > 1) {
            j++;
            binary = 0;
        }
        if (j > 27) {
            i++;
            j = 0;
        }
        if (i > 27) {
            classNum++;
            i=0;
            j=0;
        }
    }



    cout << "The model.txt is successfully imported!" << endl;
    cout << "---------------------------------------" << endl;

    return true;
}
{% endhighlight %}  
### 3.2 计算后验概率以及分类
如下面的代码块所示，每个图片都有一个对应的后验概率数组，每个数组代表了这个图片成为分类『0』-『9』的后验概率，随后该函数会找出最高的后验概率，并将图片分类到那个类别里面去。  
{% highlight c++ linenos %}
void generatingPosteriors(const Model &model,
 vector<int> &guessingLabels, vector<double> &posteriors,
                          const ImageData &image, double * posteriorPossibility) {
    double temp;
    for (int i = 0; i < IMAGE_SIZE; i++) {
        for (int j = 0; j < IMAGE_SIZE; j++) {
            if (image.Image[i][j] == 0) {
                for (int classNum = 0; classNum < CLASS_NUM; classNum++) {
                    temp = log10(model.probabilities[i][j][classNum][0]);
                    posteriorPossibility[classNum] += temp;
                }
            } else {
                for (int classNum = 0; classNum < CLASS_NUM; classNum++) {
                    temp = log10(model.probabilities[i][j][classNum][1]);
                    posteriorPossibility[classNum] += temp;
                }
            }
        }
    }
    double max = posteriorPossibility[0];
    double maxPos = 0;
    for (int i = 0; i < CLASS_NUM; i++) {
        if (posteriorPossibility[i] > max) {
            max = posteriorPossibility[i];
            maxPos = i;
        }
    }

    guessingLabels.push_back(static_cast<int &&>(maxPos));
    posteriors.push_back(max);
}
{% endhighlight %}  
## 4. 其他数据分析与校验
### 4.1 正确率计算
如上图所示```guessingLabels```数组即为程序所计算的所有的分类结果，我们只需要将这个数组与测试集的答案相对比即可。
### 4.2 构建误差矩阵
构建误差矩阵的第一步就是先统计次数：  
{% highlight c++ linenos %}
vector<int> labels = readLabelFromFile("testlabels");

    double matrix[10][10]; //confusion matrix
    for (int i =0; i < 10; i++) {
        for (int j = 0; j < 10; j++) {
            matrix[i][j] = 0;
        }
    }

    int correct = 0;

    for (unsigned long i = 0; i < labels.size(); i++) {
        if (labels.at(i) == guessingLabels.at(i)) {
            matrix[labels.at(i)][guessingLabels.at(i)]++;
            correct++;
        } else {
            matrix[labels.at(i)][guessingLabels.at(i)]++;
        }
    }
{% endhighlight %}  
随后便是计算概率：  
{% highlight c++ linenos %}
void produceConfusionMatrix(double matrix[10][10], const double count[10]) {

    cout << "The confusion matrix is: " << endl;
    for (int i =0; i < 10; i++) {
        for (int j = 0; j < 10; j++) {
            double val = matrix[i][j];
            matrix[i][j] = val / count[i];
        }
    }

    for (int i =0; i < 10; i++) {
        for (int j = 0; j < 10; j++) {
            cout << setw(12) << matrix[i][j] << setw(12);
        }
        cout << endl;
    }

    cout << "---------------------------------------" << endl;

}  
{% endhighlight %}  
### 4.3 寻找原型数字
概念很简单，我们只需要记录下每个手写数字图形的最高的后验概率（也就是将它们分进的那个组的后验概率），然后对比数据找出全局最高的后验概率，也就是最像某个分类的数字，以及最低的后验概率，也就是最不像某个分类的数字。  
{% highlight c++ linenos %}
void printHighestAndLowestPost(vector<ImageData> &trainingData, vector<int> &guessingLabels, vector<double> &posteriors,
                               vector<int> &labels) {
    double maxPost = posteriors.at(0);
    double lowPost = 1000.0;
    vector<ImageData> highestPost;
    vector<ImageData> lowestPost;
    ImageData highest;
    ImageData lowest;

    for (int i = 0; i < CLASS_NUM; i++) {
        for (unsigned long label = 0; label < labels.size(); label++) {
            if (labels.at(label) == i && labels.at(label) == guessingLabels.at(label) && posteriors.at(label) > maxPost) {
                maxPost = posteriors.at(label);
                highest = trainingData.at(label);
            }
            if(labels.at(label) == i && labels.at(label) == guessingLabels.at(label) && posteriors.at(label) < lowPost)
            {
                lowPost = posteriors.at(label);
                lowest = trainingData.at(label);
            }
        }
        highestPost.push_back(highest);
        lowestPost.push_back(lowest);
        maxPost = -1000.0;
        lowPost = 1000.0;
    }


    ofstream saveFile("../data/highestPosterior.txt");
    for (ImageData image : highestPost) {
        for (int i = 0; i < IMAGE_SIZE; i++) {
            for (int j = 0; j < IMAGE_SIZE; j++) {
                saveFile << image.Image[i][j];
            }
            saveFile << endl;
        }
        saveFile << endl;
    }

    ofstream saveFile2("../data/lowestPosterior.txt");
    for (ImageData image : lowestPost) {
        for (int i = 0; i < IMAGE_SIZE; i++) {
            for (int j = 0; j < IMAGE_SIZE; j++) {
                saveFile2 << image.Image[i][j];
            }
            saveFile2 << endl;
        }
        saveFile2 << endl;

    }
}
{% endhighlight %}  
