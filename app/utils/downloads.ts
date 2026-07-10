import type { DownloadPlatform, DownloadCard } from '~/types'

const LZ = 'https://zxabinbina.lanzoue.com/'
const ZIP = '/images/zip.svg'

export const packagePlatforms: DownloadPlatform[] = [
  {
    platformIcon: '/images/windows.svg',
    platformTitle: 'Windows 版资源包',
    cards: [
      {
        id: 'win-complete',
        title: '完整版',
        version: 'v1.2.1',
        desc: '包含服务器所有玩法模组、光影预设、优化配置。',
        size: '📏 大小: 34.7 MB',
        date: '📅 更新: 2026-03-07',
        option: { radioName: 'complete', urlDefault: `${LZ}ii6Vr3kjl2qh`, urlNone: `${LZ}i7IXh3kjl5ed` },
      },
      {
        id: 'win-notextures',
        title: '不带材质纹理包版',
        version: 'v1.2.1',
        desc: '包含服务器所有玩法模组、光影预设、优化配置，不包含材质纹理。',
        size: '📏 大小: 34.7 MB',
        date: '📅 更新: 2026-03-07',
        option: { radioName: 'no_textures', urlDefault: `${LZ}i7Ar63kjlc0b`, urlNone: `${LZ}iCTt43kjlala` },
      },
      {
        id: 'win-noshader',
        title: '不带光影版',
        version: 'v1.2.1',
        desc: '包含服务器所有玩法模组、材质纹理、优化配置，不包含光影预设。',
        size: '📏 大小: 34.7 MB',
        date: '📅 更新: 2026-03-07',
        option: { radioName: 'no_shadows', urlDefault: `${LZ}iYt3D3kjl9fi`, urlNone: `${LZ}iRNi53kjl8tg` },
      },
      {
        id: 'win-none',
        title: '仅带必要资源版',
        version: 'v1.2.1',
        desc: '只包含服务器所有玩法模组、优化配置。',
        size: '📏 大小: 34.7 MB',
        date: '📅 更新: 2026-03-07',
        option: { radioName: 'none', urlDefault: `${LZ}iFtGx3kjl89g`, urlNone: `${LZ}iDe1G3kjl6uf` },
      },
    ],
  },
  {
    platformIcon: '/images/android.svg',
    platformTitle: 'Android 版资源包',
    tip: '💡 不知道什么是 Mobile Glues 渲染器？',
    groups: [
      {
        rendererIcon: '/images/MobileGlues.webp',
        rendererTitle: 'Mobile Glues 渲染器专用版（推荐）',
        cards: [
          {
            id: 'android-mg-complete',
            title: '完整版',
            version: 'v1.2.1',
            desc: '针对该渲染器的版本，包含服务器所有玩法模组、光影预设、材质纹理、优化配置。',
            size: '📏 大小: 37.4 MB',
            date: '📅 更新: 2026-03-08',
            note: '注意：该版本只能由 Mobile Glues 渲染器使用，其他渲染器一旦加载就会直接崩溃！',
            option: { radioName: 'mg_complete', urlDefault: `${LZ}iOaYP3kjldkh`, urlNone: `${LZ}ieoPb3kjlezi` },
          },
          {
            id: 'android-mg-notextures',
            title: '不带材质纹理包版',
            version: 'v1.2.1',
            desc: '针对该渲染器的版本，包含服务器所有玩法模组、光影预设、优化配置，不包含材质纹理。',
            size: '📏 大小: 37.4 MB',
            date: '📅 更新: 2026-03-08',
            note: '注意：该版本只能由 Mobile Glues 渲染器使用，其他渲染器一旦加载就会直接崩溃！',
            option: { radioName: 'mg_no_textures', urlDefault: `${LZ}i90Tc3kjllyj`, urlNone: `${LZ}iYIom3kjlkuj` },
          },
          {
            id: 'android-mg-noshader',
            title: '不带光影版',
            version: 'v1.2.1',
            desc: '针对该渲染器的版本，包含服务器所有玩法模组、材质纹理、优化配置，不包含光影预设。',
            size: '📏 大小: 37.4 MB',
            date: '📅 更新: 2026-03-08',
            note: '注意：该版本只能由 Mobile Glues 渲染器使用，其他渲染器一旦加载就会直接崩溃！',
            option: { radioName: 'mg_noshader', urlDefault: `${LZ}iRLoD3kjlk5e`, urlNone: `${LZ}iMcBq3kjlire` },
          },
          {
            id: 'android-mg-none',
            title: '仅带必要资源版',
            version: 'v1.2.1',
            desc: '只包含服务器所有玩法模组、优化配置。',
            size: '📏 大小: 37.4 MB',
            date: '📅 更新: 2026-03-08',
            note: '注意：该版本只能由 Mobile Glues 渲染器使用，其他渲染器一旦加载就会直接崩溃！',
            option: { radioName: 'mg_none', urlDefault: `${LZ}isUjN3kjlhgh`, urlNone: `${LZ}iz3SW3kjlg8d` },
          },
        ],
      },
      {
        rendererIcon: '/images/UniversalRenderer.webp',
        rendererTitle: '通用渲染器版（建议使用 Holy GL4ES 渲染器）',
        cards: [
          {
            id: 'android-univ-complete',
            title: '完整版',
            version: 'v1.2.1',
            desc: '适用于所有主流渲染器，兼容性最佳，功能完整。',
            size: '📏 大小: 37.4 MB',
            date: '📅 更新: 2026-03-08',
            note: '注意：该版本无法使用光影和优化，不建议使用该版本，除非你无法使用 Mobile Glues 渲染器！',
            option: { radioName: 'univ_complete', urlDefault: `${LZ}ioPea3kjln9g`, urlNone: `${LZ}iatpx3kjloud` },
          },
          {
            id: 'android-univ-none',
            title: '仅包含必要资源版',
            version: 'v1.2.1',
            desc: '适用于所有主流渲染器，兼容性最佳。',
            size: '📏 大小: 37.4 MB',
            date: '📅 更新: 2026-03-08',
            note: '注意：该版本无法使用光影和优化，不建议使用该版本，除非你无法使用 Mobile Glues 渲染器！',
            option: { radioName: 'univ_none', urlDefault: `${LZ}ij7T43kjlr2d`, urlNone: `${LZ}ivehp3kjlpti` },
          },
        ],
      },
    ],
  },
]

const asLauncher = (c: Omit<DownloadCard, 'buttonText'> & { buttonText?: string }): DownloadCard => ({
  buttonText: '前往官方网站下载',
  ...c,
})

export const launcherPlatforms: DownloadPlatform[] = [
  {
    platformIcon: '/images/windows.svg',
    platformTitle: 'Windows 启动器',
    cards: [
      asLauncher({ icon: '/images/PCL2.webp', title: 'PCL 2', version: '由 <strong>龙腾猫跃</strong> 开发', desc: '最棒的第三方 Windows 的 Minecraft JAVA 版启动器，提供超快的下载速度、智能模组管理、简洁美观的界面，让您的体验更加出色。', href: 'https://afdian.com/p/0164034c016c11ebafcb52540025c377' }) as DownloadCard,
      asLauncher({ icon: '/images/HMCL.webp', title: 'HMCL', version: '由 <strong>huangyuhui</strong> 开发', desc: '十二年历史的第三方启动器，具有多系统支持、全新界面，支持导入多款国外启动器下载的整合包、创建与安装游戏，个性化主题。', href: 'https://hmcl.huangyuhui.net/download' }) as DownloadCard,
      asLauncher({ icon: '/images/BakaXL.webp', title: 'BakaXL', version: '由 <strong>TT702</strong> 开发', desc: '打破传统启动器的层级概念，使用起来更加称心如意。强大的自定义主题功能无需任何额外付费即可使用，还有视差效果和实况壁纸加持，实在是泰裤辣！', href: 'https://www.bakaxl.com/#download' }) as DownloadCard,
      asLauncher({ icon: '/images/minecraft-launcher.webp', title: 'Minecraft Launcher', version: '由 <strong>MOJANG</strong> 开发', desc: '官方启动器，一个账号，多架构平台启动。', href: 'https://www.minecraft.net/download' }) as DownloadCard,
    ],
  },
  {
    platformIcon: '/images/android.svg',
    platformTitle: 'Android 启动器',
    cards: [
      { icon: '/images/FCL.webp', title: 'FCL', version: '由 <strong>FCL-Team</strong> 开发', desc: '由 FCL 团队开发的 Android 平台 Minecraft: Java Edition 启动器。基于 HMCL 的核心功能，结合 PojavLauncher 后端和 Boat 后端，让您能在移动设备上畅玩 Java 版 MC ，支持模组加载与全版本运行。', href: 'https://foldcraftlauncher.cn', buttonText: '前往镜像网站下载' } as DownloadCard,
      { icon: '/images/zl.webp', title: 'ZL 2', version: '由 <strong>ZalithLauncher</strong> 开发', desc: '在 Android 设备上运行 Minecraft Java 版，更好的界面，更多实用功能，更低的使用门槛。', href: 'https://www.zalithlauncher.cn/zl2-download.html', buttonText: '前往镜像网站下载' } as DownloadCard,
    ],
  },
]

export { ZIP }
