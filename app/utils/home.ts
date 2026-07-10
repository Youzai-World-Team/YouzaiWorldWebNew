import type {FeatureSlide, TeamMember, WorldInfo} from '~/types'

export const worlds: WorldInfo[] = [
    {
        id: 'survival',
        title: '生存世界',
        subtitle: '经典生存，自由探索',
        mainImage: '/images/worlds/survival.webp',
        sideImage: '/images/worlds/survival.webp',
        desc: '经典生存模式，采集资源、建造家园、挑战怪物。与伙伴一起探索广阔的世界。',
        features: [
            '✅ 完整原版生存体验',
            '✅ 世界拓展包，新增地形和生物',
            '✅ 遗迹增加，丰富冒险内容',
            '✅ 添加四季变换系统、丰富农夫乐事的种植体验，增强沉浸感',
        ],
        link: '/read_agreements/world_rules&play_agreement/survival',
    },
    {
        id: 'creative',
        title: '创造世界',
        subtitle: '无限资源，创意搭建',
        mainImage: '/images/worlds/creative.webp',
        sideImage: '/images/worlds/creative.webp',
        desc: '创造模式，无限资源，飞行权限，让你尽情发挥想象力，建造宏伟建筑或红石机械。',
        features: [
            '✅ 可随意破坏和放置方块，无任何限制',
            '✅ 可测试红石机械和复杂装置，适合技术玩家',
            '✅ 飞行权限，方便建造',
            '✅ 可申请获得 WorldEdit 模组权限，极大提升建筑效率和创造力',
        ],
        link: '/read_agreements/world_rules&play_agreement/creative',
        applyLink: '/apply/creative',
    },
    {
        id: 'building',
        title: '建筑世界',
        subtitle: '平坦地形，专注建筑',
        mainImage: '/images/worlds/building.webp',
        sideImage: '/images/worlds/building.webp',
        desc: '专门为建筑爱好者准备的世界，让你专注建筑艺术。',
        features: [
            '✅ 不允许任何人随意破坏，保护建筑作品',
            '✅ 未取得权限的玩家为冒险模式，方便参观',
            '✅ 同样可以申请获得 WorldEdit 模组权限，极大提升建筑效率和创造力',
            '✅ 建筑比赛专区',
        ],
        link: '/read_agreements/world_rules&play_agreement/building',
        applyLink: '/apply/creative',
    },
    {
        id: 'more',
        title: '更多世界等待开放',
        sideImage: '/images/worlds/more.webp',
    },
]

export const featureSlides: FeatureSlide[] = [
    {
        image: '/images/feature/img_1.webp',
        title: '世界冒险',
        description: '加入了 When Dungeons Arise 等拓展地图的 MOD<br>使世界更加丰富，在世界上跑图探索遗迹、建筑吧'
    },
    {
        image: '/images/feature/img_2.webp',
        title: '属性加成',
        description: '通过游玩获得技能点<br>在属性面板中分配技能点以提升属性'
    },
    {image: '/images/feature/img_3.webp', title: '机械动力', description: '欢迎来到机械动力<br>开始搭建你的工业体系吧'},
    {
        image: '/images/feature/img_4.webp',
        title: '传送石碑',
        description: '可通过瞬移卷轴或传送石回到传送石碑<br>免去了长途跋涉的烦恼'
    },
    {
        image: '/images/feature/img_5.webp',
        title: '农夫乐事',
        description: '现在，是时候开始耕种了<br>借助工具、烹饪系统和食材，就能够烹饪各种各样的美食'
    },
    {
        image: '/images/feature/img_6.webp',
        title: '四季变换',
        description: '在某些季节种植作物会更佳<br>冬季时各地区都会下雪，河流会结冰'
    },
    {image: '/images/feature/img_7.webp', title: '旅行背包', description: '探索必备<br>更大的背包容量，更多的功能'},
    {
        image: '/images/feature/img_8.webp',
        title: '捆扎方块',
        description: '只需用一根栓绳加一些方块<br>就可以将一些方块捆扎在一起'
    },
    {
        image: '/images/feature/img_9.webp',
        title: '管道物流',
        description: '添加了过滤器和管道来升级物流系统<br>还有比原版漏斗更稳定物品传输机制'
    },
    {
        image: '/images/feature/img_10.webp',
        title: '照相相机',
        description: '在游戏里使用相机拍照吧<br>拍下的照片可以挂在墙上或导出'
    },
    {
        image: '/images/feature/img_11.webp',
        title: '自然罗盘',
        description: '一个实用的物品<br>可让你在世界任何地方搜索生物群系的位置'
    },
    {
        image: '/images/feature/img_12.webp',
        title: '更多附魔',
        description: '加入了一些附魔<br>有些需要在遗迹中探索以获得'
    },
    {
        image: '/images/feature/img_12.webp',
        title: '轻量传送',
        description: '使用 /tpa 互相传送<br>使用 /back 返回死亡点'
    },
    {
        image: '/images/feature/img_12.webp',
        title: '保留装备',
        description: '死亡时不会掉落全部物品<br>而是会保留您已经装备的装备及快捷栏物品'
    },
    {image: '/images/feature/img_12.webp', title: '击杀掉头', description: '当击败一个玩家时<br>会掉落该玩家的头颅'},
]

export const team: TeamMember[] = [
    {
        name: 'zxaBinbin',
        avatar: '/images/team/zxaBinbin.webp',
        roles: [{label: '★服主★'}],
        duty: '服务器的主要维护者，负责功能实现和服务器运营',
        bio: '逆风方向适合坠机',
        links: [
            {title: 'Xbox 个人主页', icon: '/images/xbox.svg', url: 'https://launch.minecraft.net/profile/zxaBinbin'},
            {title: '哔哩哔哩 个人空间', icon: '/images/bilibili.svg', url: 'https://space.bilibili.com/1939997417'},
            {title: 'Github 个人主页', icon: '/images/github.svg', url: 'https://github.com/zxaBinbina'},
        ],
    },
    {
        name: 'ress2338396',
        avatar: '/images/team/ress2338396.webp',
        roles: [{label: '★运维★'}],
        duty: '负责服务器的正常运行和资源维护',
        bio: '我再也不玩抽象了',
        links: [
            {title: 'Xbox 个人主页', icon: '/images/xbox.svg', url: 'https://launch.minecraft.net/profile/ress2338396'},
            {title: '哔哩哔哩 个人空间', icon: '/images/bilibili.svg', url: 'https://space.bilibili.com/494565117'},
            {title: 'Github 个人主页', icon: '/images/github.svg', url: 'https://github.com/JessDaodao'},
            {title: 'NameMC 个人页', icon: '/images/namemc.svg', url: 'https://namemc.com/profile/ress2338396'},
        ],
    },
    {
        name: 'GrantedCar81239',
        avatar: '/images/team/grantedCar81239.webp',
        roles: [{label: '★管理★'}, {label: '已离线', danger: true}],
        duty: '负责服务器的建设和指令',
        bio: '呼吸脚步律动不停',
        links: [
            {
                title: 'Xbox 个人主页',
                icon: '/images/xbox.svg',
                url: 'https://launch.minecraft.net/profile/GrantedCar81239'
            },
            {title: '哔哩哔哩 个人空间', icon: '/images/bilibili.svg', url: 'https://space.bilibili.com/2007531381'},
        ],
    },
    {
        name: 'Maskviva',
        avatar: '/images/team/maskviva.webp',
        roles: [{label: '★开发★'}],
        duty: '负责服务器的 MOD 开发、玩法开发及维护',
        links: [
            {title: '个人网站', icon: '/images/home.svg', url: 'https://www.maskviva.xyz'},
            {title: '哔哩哔哩 个人空间', icon: '/images/bilibili.svg', url: 'https://space.bilibili.com/520912096'},
            {title: 'Github 个人主页', icon: '/images/github.svg', url: 'https://github.com/Maskviva'},
        ],
    },
]

export const strengths = [
    {
        image: '/images/strength_1.webp',
        alt: '真的纯公益',
        title: '公益',
        desc: '没有 VIP 特权<br>唯一的收入只有赞助',
        link: '/donate',
        linkText: '▷ 赞助我们'
    },
    {
        image: '/images/strength_2.webp',
        alt: '飞起来',
        title: '快速',
        desc: 'AMD Ryzen 7 5800X 服务器<br>让你的游戏体验飞起来',
        link: '/status',
        linkText: '▷ 查看状态'
    },
    {
        image: '/images/strength_3.webp',
        alt: '没有神权行为',
        title: '友善',
        desc: '友善的玩家和管理<br>没有神权行为',
        link: '/banlist',
        linkText: '▷ 查看玩家处罚'
    },
    {
        image: '/images/strength_4.webp',
        alt: '版本更新',
        title: '更新',
        desc: '定期同步国际版进度<br>保持版本较新',
        link: '/#version',
        linkText: '▷ 查看版本信息'
    },
    {
        image: '/images/strength_5.webp',
        alt: '允许生电',
        title: '生电',
        desc: '允许在服务器内建造生电机器<br>但禁止建造以崩服为目的机器'
    },
]
