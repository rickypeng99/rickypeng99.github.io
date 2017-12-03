---
layout: post
title: 使用 Java 播放 mp3 和 wav 格式的音频
category: Java
tags: Java, JavaSound
keywords: Java, JavaSound
description: How to use JavaSound to play mp3
---

个人项目 [Dekoder](https://github.com/ice1000/Dekoder) 到了第五个版本——v1.3 。
在使用 Java 做音乐播放的时候走了不少弯路。留下一篇文章警醒后人（误）。

## 播放 wav

wav 的播放倒是非常简单，网上随便搜索就会出来。这里提供一些我随手找的链接，多找几个以防他们挂掉（真的是随手找的，就是我自己 bing 搜索之后简单筛选了一下的结果）：

- [link1](http://www.anyexample.com/programming/java/java_play_wav_sound_file.xml)
- [link2](http://blog.163.com/penghaimin138@126/blog/static/1336243962009103010149510)
- [link3](http://blog.csdn.net/zi_jun/article/details/7971846)
- [link4](http://tech.163.com/tm/030531/030531_95896.html) 推荐，有 JavaSound 的 SourceDataLine 等类之间的关系、音频播放原理的讲解。
- [link5](http://blog.csdn.net/jgd28/article/details/4566672)

其实这个功能 Dekoder 最早的版本就已经支持了——播放 wav ，多简单个事。

另外，你的播放代码应该是这样的（我的代码是用 Kotlin 写的，这里就不贴出来了）：

```java
File audio = new File("你的音频文件路径");
audioInputStream = AudioSystem.getAudioInputStream(audio);
AudioFormat audioFormat = audioInputStream.getFormat();
if (audioFormat.getEncoding() != AudioFormat.Encoding.PCM_SIGNED) {
  audioFormat = new AudioFormat(AudioFormat.Encoding.PCM_SIGNED,
      audioFormat.getSampleRate(), 16,
      audioFormat.getChannels(),
      audioFormat.getChannels() * 2,
      audioFormat.getSampleRate(), false);
  audioInputStream = AudioSystem.getAudioInputStream(audioFormat,
      audioInputStream);
}
DataLine.Info info = new Info(SourceDataLine.class, audioFormat);
sourceDataLine = (SourceDataLine) AudioSystem.getLine(info);
sourceDataLine.open();
sourceDataLine.start();
floatVoiceControl.setValue(-20);
byte[] buf = new byte[0xFF];
int onceReadDataSize = 0;
while ((onceReadDataSize = audioInputStream
    .read(buf, 0, buf.length)) != -1)
  sourceDataLine.write(buf, 0, onceReadDataSize);

sourceDataLine.drain();
sourceDataLine.close();
audioInputStream.close();
```

呃，最后别忘了 try catch ！

不过当你用这样的代码打开 MP3 文件的时候，你会看到 

```
javax.sound.sampled.UnsupportedAudioFileException: 
  could not get audio input stream from input file
```

这样的报错。我在这个问题上起码纠结了接近一个月，中间还跑去学了 Lua 和 C#，最终才得以解决这个~~本来怎么看都应该是甲骨文的错的~~问题。

## 播放 mp3

不得不说，我找到这个项目的时间绝对不比找到 JFoenix 的时间短。

[这个项目](http://www.javazoom.net/mp3spi/sources.html)简直堪称业界良心，虽然文档还是简陋了点，虽然它还是有 bug （总时长获取失败）。

这是一个非常优秀的项目，它不需要 JMF ，不需要 JNI ，不需要 C\+\+，就完成了 Java 对于 MP3 的解码。而且最重要的是，你只需要导入它帮助文档中所说的三个 jar 包到你的项目内之后，你就能愉快地播放 MP3 了——就是原来的 wav 播放代码，不需要修改！

mp3spi 目前的最新版本是 1.9.5 ，不要被那些早就 deprecated 的博客给骗了——
当然，要是我的博客什么时候也 deprecated 了，请务必邮件通知我。。。。我一定修改。。。。

然后别动你上面的代码。试试用它打开一个 MP3 文件。

怎么样？惊喜吧？

没错，当时我心里也是这样的感受。

其实，我现在心里也是这样的感受。

赶紧吸一口，让我拿自己的播放器听听 girigiri 爱——

![](https://coding.net/u/ice1000/p/Images/git/raw/master/blog-img/old/java/javasound/1.png)

我说完了
