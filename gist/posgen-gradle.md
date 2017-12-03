---
layout: gist
title: 我写过的最复杂的 build.gradle
---

```groovy
group 'org.ice1000'
version '0.0.1'

def runTestMode = false

buildscript {
  ext.kotlin_version = '1.1.4-3'
  repositories {
    mavenCentral()
  }
  dependencies {
    classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
  }
}

def platformJs = !runTestMode || System.getenv("USER") != 'ice1000'

if (platformJs) apply plugin: 'kotlin2js'
else apply plugin: 'kotlin'

sourceCompatibility = 1.8
targetCompatibility = 1.8

repositories {
  mavenCentral()
  repositories {
    flatDir {
      dirs 'lib'
    }
  }
}

sourceSets {
  main.kotlin.srcDirs += 'src/main'
  if (platformJs) main.kotlin.srcDirs += 'src/js'
  // testing
  else test.kotlin.srcDirs += 'test/junit'
  main.resources.srcDirs += 'res'
}

configurations {
  artifact
}

dependencies {
  if (platformJs) artifact "org.jetbrains.kotlin:kotlin-stdlib-js:$kotlin_version"
  else {
    artifact "org.jetbrains.kotlin:kotlin-stdlib-jre8:$kotlin_version"
    testCompile group: 'junit', name: 'junit', version: '4.12'
    testCompile "org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version"
  }
  configurations.compile.extendsFrom(configurations.artifact)
}

if (platformJs) {
  def webDir = "$buildDir/web"

  compileKotlin2Js {
    kotlinOptions.outputFile = "$webDir/posgen.js"
    kotlinOptions.moduleKind = "amd"
    kotlinOptions.sourceMap = true
  }

  //noinspection GroovyAssignabilityCheck
  task copyLicense {
    outputs.file new File("$webDir/LICENSE")
    doLast {
      copy {
        from "LICENSE"
        into webDir
      }
    }
  }

  //noinspection GroovyAssignabilityCheck
  task assembleWeb(type: Sync) {
    configurations.compile.each { File file ->
      from(zipTree(file.absolutePath), {
        includeEmptyDirs = false
        include { fileTreeElement ->
          def path = fileTreeElement.path
          path.endsWith(".js") && (path.startsWith("META-INF/resources/") ||
              !path.startsWith("META-INF/"))
        }
      })
    }
    from compileKotlin2Js.destinationDir
    into webDir
    dependsOn classes
    dependsOn copyLicense
  }

  //noinspection GroovyAssignabilityCheck
  task zipWeb(type: Zip) {
    from webDir
    into "web"
    archiveName = "posgen.zip"
    dependsOn build
    dependsOn classes
    dependsOn copyLicense
    dependsOn assembleWeb
  }

  assemble.dependsOn assembleWeb
}
```
