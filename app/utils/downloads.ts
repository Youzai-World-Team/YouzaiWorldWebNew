export interface LauncherDownload {
  id: string
  name: string
  url: string
  developer: string
  description: string
  icon: string
}

export const launcherDownloads: LauncherDownload[] = [
  {
    id: 'pcl2',
    name: 'PCL 2',
    url: 'https://afdian.com/p/0164034c016c11ebafcb52540025c377',
    developer: '由 龙腾猫跃 开发',
    description: '最棒的第三方 Windows 的 Minecraft JAVA 版启动器，提供超快的下载速度、智能模组管理、简洁美观的界面，让您的体验更加出色。',
    icon: 'https://assets.mcyzw.top/images/PCL2.webp',
  },
  {
    id: 'hmcl',
    name: 'HMCL',
    url: 'https://hmcl.huangyuhui.net/download',
    developer: '由 huangyuhui 开发',
    description: '十二年历史的第三方启动器，具有多系统支持、全新界面，支持导入多款国外启动器下载的整合包、创建与安装游戏，个性化主题。',
    icon: 'https://assets.mcyzw.top/images/HMCL.webp',
  },
  {
    id: 'bakaxl',
    name: 'BakaXL',
    url: 'https://www.bakaxl.com/#download',
    developer: '由 TT702 开发',
    description: '打破传统启动器的层级概念，使用起来更加称心如意。强大的自定义主题功能无需任何额外付费即可使用，还有视差效果和实况壁纸加持，实在是泰裤辣！',
    icon: 'https://assets.mcyzw.top/images/BakaXL.webp',
  },
]
