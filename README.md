# Timestamp File

VS Code 扩展 | 快速在指定位置创建时间戳命名的文件，适用于喜欢Ctrl+N打开一堆临时页面，想保存又不想一一命名的人

## 功能

* 自动生成 ISO 时间戳格式的文件名
* 自定义文件保存目录、子目录、文件后缀
* 支持路径变量（${workspaceFolder}/${userHome}/${fileDirname}）
* 自动递归创建目录，不会覆盖已有文件
* 创建后自动打开文件

类似于VNote的灵犀页？

## 使用方法
* Windows/Linux: Ctrl + Shift + P
* Mac: Cmd + Shift + P

注意: 默认使用的快捷键是新建vscode窗口的，如需要替换请根据下面的命令ID自行配置快捷键

## 命令

* 命令 ID: `timestamp-file.newTimestampFile`

## 配置项

在 VS Code 设置中搜索 `Timestamp File` 自定义配置: 

```txt
"timestampFile.baseDirectory": "${workspaceFolder}",
"timestampFile.subDirectory": ".inspiration",
"timestampFile.fileExtension": ".txt"
```

## 碎碎念

本项目主要用于个人学习 VS Code 扩展开发。VS Code 自带的临时文件功能虽好用，但关闭编辑器时频繁弹出的文件保存弹窗十分影响体验；同时我也曾遇到临时文件被意外清理导致内容丢失的情况。出于对 VS Code 扩展开发的好奇，我编写了这个小工具。总体代码量很少，但基本已经满足个人日常使用需求。如有需要请随意取用。