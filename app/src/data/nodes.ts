// 共享知识节点数据 —— 首页、探索页、知识域页共用
// 每个节点字段：id / 中文名 / 英文名 / 分类 / 引力值(1-3) / 摘要 / 关联节点 id 列表 / 延伸阅读

export type CategoryId =
  | 'science'
  | 'technology'
  | 'humanity'
  | 'art'
  | 'philosophy'
  | 'nature'

export interface CategoryMeta {
  id: CategoryId
  zh: string
  en: string
  color: string
  description: string
  cover: string
}

export interface ReadingLink {
  title: string
  url: string
}

export interface KnowledgeNode {
  id: string
  title: string
  enTitle: string
  category: CategoryId
  gravity: 1 | 2 | 3
  summary: string
  related: string[]
  furtherReading: ReadingLink[]
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'science',
    zh: '科学',
    en: 'SCIENCE',
    color: '#FFB547',
    description: '从量子到宇宙，理解世界的底层规则',
    cover: '/topic-science.jpg',
  },
  {
    id: 'technology',
    zh: '技术',
    en: 'TECHNOLOGY',
    color: '#5CFFC0',
    description: '工具如何重塑人类自身',
    cover: '/topic-technology.jpg',
  },
  {
    id: 'humanity',
    zh: '人文',
    en: 'HUMANITY',
    color: '#8B7CFF',
    description: '历史、社会与我们讲述的故事',
    cover: '/topic-humanity.jpg',
  },
  {
    id: 'art',
    zh: '艺术',
    en: 'ART',
    color: '#FF6EC7',
    description: '感性如何成为一种知识',
    cover: '/topic-art.jpg',
  },
  {
    id: 'philosophy',
    zh: '哲学',
    en: 'PHILOSOPHY',
    color: '#4DE3FF',
    description: '那些没有标准答案的问题',
    cover: '/topic-philosophy.jpg',
  },
  {
    id: 'nature',
    zh: '自然',
    en: 'NATURE',
    color: '#7DD87D',
    description: '生命系统的精妙与脆弱',
    cover: '/topic-nature.jpg',
  },
]

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryMeta>

const read = (q: string, title: string): ReadingLink => ({
  title,
  url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
})

export const NODES: KnowledgeNode[] = [
  // ── 科学 Science ──────────────────────────────────────────────
  {
    id: 'quantum-entanglement',
    title: '量子纠缠',
    enTitle: 'Quantum Entanglement',
    category: 'science',
    gravity: 3,
    summary:
      '相隔光年的两个粒子，如何共享同一个命运。纠缠态中的粒子对无论相距多远，测量其一便会瞬时决定另一个的状态——爱因斯坦称之为"鬼魅般的超距作用"，而贝尔不等式的实验证伪让这场争论尘埃落定。它既是量子计算的燃料，也是重新思考"定域性"与"实在性"的起点。',
    related: ['schrodinger-equation', 'speed-of-light', 'turing-machine', 'ship-of-theseus'],
    furtherReading: [
      read('quantum entanglement', 'Quantum entanglement — Wikipedia'),
      read('EPR paradox', 'EPR paradox：爱因斯坦之问'),
      read('Bell test', '贝尔实验百年回顾'),
    ],
  },
  {
    id: 'general-relativity',
    title: '广义相对论',
    enTitle: 'General Relativity',
    category: 'science',
    gravity: 3,
    summary:
      '引力不是力，而是时空的弯曲。1915 年爱因斯坦写下场方程，把牛顿的万有引力改写为几何：质量告诉时空如何弯曲，时空告诉物质如何运动。从水星近日点的进动，到黑洞照片与引力波的捕获，人类一次次在最极端的尺度上验证了这支最优雅的理论。',
    related: ['speed-of-light', 'dark-matter', 'quantum-entanglement'],
    furtherReading: [
      read('general relativity', 'General relativity — Wikipedia'),
      read('gravitational wave', '引力波探测简史'),
    ],
  },
  {
    id: 'crispr',
    title: 'CRISPR 基因编辑',
    enTitle: 'CRISPR Gene Editing',
    category: 'science',
    gravity: 3,
    summary:
      '细菌用来自卫的免疫系统，被人类改造成了一把可以改写生命蓝图的分子剪刀。CRISPR-Cas9 让基因编辑从昂贵的实验室工程变成桌面级的操作：定点剪切、替换、沉默任意 DNA 序列。它治愈了镰状细胞贫血，也打开了关于"设计婴儿"的伦理深渊。',
    related: ['mycorrhizal-network', 'photosynthesis', 'trolley-problem'],
    furtherReading: [
      read('CRISPR', 'CRISPR — Wikipedia'),
      read('CRISPR ethics', '基因编辑的伦理边界'),
    ],
  },
  {
    id: 'dark-matter',
    title: '暗物质',
    enTitle: 'Dark Matter',
    category: 'science',
    gravity: 2,
    summary:
      '宇宙中约 27% 的质能由一种不发光、不与电磁波相互作用的物质构成。星系的旋转曲线、引力透镜与宇宙微波背景都指向它的存在，但地下深处的一个个探测器至今一无所获。暗物质是现代物理学最大的悬念：我们知道它在那里，却不知道它是什么。',
    related: ['general-relativity', 'skepticism', 'occams-razor'],
    furtherReading: [
      read('dark matter', 'Dark matter — Wikipedia'),
      read('WIMP', 'WIMP 搜寻四十年'),
    ],
  },
  {
    id: 'second-law',
    title: '热力学第二定律',
    enTitle: 'Second Law of Thermodynamics',
    category: 'science',
    gravity: 2,
    summary:
      '孤立系统的熵永不减少——这条定律为时间指定了方向，也为宇宙写好了结局。从蒸汽机效率的极限到麦克斯韦妖的思想实验，再到香农把它翻译为信息的度量，熵增原理横跨工程、物理与信息论，是少数几条物理学家愿意"以性命担保"的定律。',
    related: ['photosynthesis', 'schrodinger-equation', 'existentialism'],
    furtherReading: [
      read('second law of thermodynamics', 'Second law of thermodynamics — Wikipedia'),
      read('entropy and information', '熵与信息：香农的桥'),
    ],
  },
  {
    id: 'plate-tectonics',
    title: '板块构造论',
    enTitle: 'Plate Tectonics',
    category: 'science',
    gravity: 2,
    summary:
      '大陆不是固定的舞台，而是漂浮在软流圈上的拼图。魏格纳 1912 年提出大陆漂移时被群嘲，直到海底扩张的证据出现，地质学才完成自己的"哥白尼革命"。板块运动塑造了山脉、地震与深海热泉，也以亿年为单位调节着地球的气候与生命的演化节奏。',
    related: ['hydrothermal-vent', 'aurora', 'great-voyages'],
    furtherReading: [
      read('plate tectonics', 'Plate tectonics — Wikipedia'),
      read('Wegener continental drift', '魏格纳与大陆漂移说的沉浮'),
    ],
  },
  {
    id: 'speed-of-light',
    title: '光速不变',
    enTitle: 'Invariance of Light Speed',
    category: 'science',
    gravity: 1,
    summary:
      '无论你如何追赶一束光，它都恒以每秒约三十万公里的速度离你远去。这个反直觉的实验事实迫使爱因斯坦放弃了绝对时间与绝对空间，换来了狭义相对论：运动的时钟变慢，运动的尺子缩短。光速不是光的速度，而是因果律本身的速度上限。',
    related: ['general-relativity', 'quantum-entanglement', 'allegory-of-cave'],
    furtherReading: [
      read('speed of light', 'Speed of light — Wikipedia'),
      read('Michelson Morley', '迈克耳孙-莫雷实验始末'),
    ],
  },
  {
    id: 'schrodinger-equation',
    title: '薛定谔方程',
    enTitle: 'Schrödinger Equation',
    category: 'science',
    gravity: 1,
    summary:
      '描述量子世界的基本方程：一个波函数，装着粒子所有可能的命运。它精确预言了原子光谱与化学键，却留下著名的测量难题——那只既死又活的猫。方程本身优雅而确定，真正不确定的是我们如何理解它描绘的实在。',
    related: ['quantum-entanglement', 'second-law', 'zhuangzi-butterfly'],
    furtherReading: [
      read('Schrödinger equation', 'Schrödinger equation — Wikipedia'),
      read('Schrödinger cat', '薛定谔的猫：一个被误读的讽刺'),
    ],
  },
  // ── 技术 Technology ───────────────────────────────────────────
  {
    id: 'transformer',
    title: 'Transformer',
    enTitle: 'Transformer Architecture',
    category: 'technology',
    gravity: 3,
    summary:
      '注意力机制：让机器学会"看重点"的架构革命。2017 年的论文《Attention Is All You Need》抛弃了循环与卷积，用自注意力让序列中的每个词直接对话。它成为大语言模型的共同骨架，也让"规模即能力"的时代正式开启。',
    related: ['reinforcement-learning', 'turing-machine', 'tcp-ip'],
    furtherReading: [
      read('Transformer (deep learning architecture)', 'Transformer — Wikipedia'),
      read('Attention Is All You Need', 'Attention Is All You Need（原论文）'),
    ],
  },
  {
    id: 'blockchain',
    title: '区块链',
    enTitle: 'Blockchain',
    category: 'technology',
    gravity: 2,
    summary:
      '一本所有人共同维护、无人能单方面篡改的分布式账本。通过哈希链、共识算法与经济激励，区块链把"信任"从机构手里搬到协议之中。它催生了加密货币与智能合约，也不断在效率、能耗与去中心化之间艰难地寻找平衡。',
    related: ['tcp-ip', 'printing-revolution', 'turing-machine'],
    furtherReading: [
      read('blockchain', 'Blockchain — Wikipedia'),
      read('Bitcoin whitepaper', '比特币白皮书精读'),
    ],
  },
  {
    id: 'turing-machine',
    title: '图灵机',
    enTitle: 'Turing Machine',
    category: 'technology',
    gravity: 2,
    summary:
      '一条纸带、一个读写头、一张规则表——图灵用这台想象中的机器定义了"可计算"的边界。它是所有现代计算机的理论原型，也给出了停机问题这个不可解的深渊：有些事情，任何算法都永远无法判定。',
    related: ['transformer', 'gothic-cathedral', 'occams-razor', 'blockchain'],
    furtherReading: [
      read('Turing machine', 'Turing machine — Wikipedia'),
      read('halting problem', '停机问题与计算的极限'),
    ],
  },
  {
    id: 'tcp-ip',
    title: 'TCP/IP',
    enTitle: 'TCP/IP Protocol Suite',
    category: 'technology',
    gravity: 2,
    summary:
      '互联网的通用语：把消息切成包，各自寻路，到终点再拼回原样。分层设计让底层网络可以千差万别，上层应用却只需面对统一的接口。这套诞生于冷战年代的协议族，用极简的设计承载了整个人类数字文明的流量。',
    related: ['blockchain', 'transformer', 'silk-road'],
    furtherReading: [
      read('Internet protocol suite', 'Internet protocol suite — Wikipedia'),
      read('end-to-end principle', '端到端原则：互联网的设计哲学'),
    ],
  },
  {
    id: 'containerization',
    title: '容器化',
    enTitle: 'Containerization',
    category: 'technology',
    gravity: 1,
    summary:
      '把应用连同它的依赖、配置与环境打包进一个标准化的"集装箱"，从此"在我机器上能跑"不再是借口。从 chroot 到 Docker 再到 Kubernetes，容器化重塑了软件交付的方式，也让云成为真正意义上可编程的基础设施。',
    related: ['tcp-ip', 'reinforcement-learning'],
    furtherReading: [
      read('OS-level virtualization', 'OS-level virtualization — Wikipedia'),
      read('Docker history', 'Docker 简史'),
    ],
  },
  {
    id: 'lidar',
    title: '激光雷达',
    enTitle: 'LiDAR',
    category: 'technology',
    gravity: 1,
    summary:
      '用一束束激光脉冲为机器绘制世界的三维轮廓。通过测量光往返的时间，激光雷达能在黑夜与浓雾中构建厘米级精度的点云地图——它既是自动驾驶汽车最可靠的眼睛，也被考古学家用来在丛林之下发现失落的古城。',
    related: ['transformer', 'migration-navigation', 'plate-tectonics'],
    furtherReading: [
      read('lidar', 'Lidar — Wikipedia'),
      read('lidar archaeology', '激光雷达考古学'),
    ],
  },
  {
    id: 'lithography',
    title: '芯片光刻',
    enTitle: 'Photolithography',
    category: 'technology',
    gravity: 1,
    summary:
      '人类工业精度的巅峰：用极紫外光在硅片上刻出比病毒还小的晶体管。一台 EUV 光刻机汇聚光学、材料与精密机械的全部极限，数纳米的线宽之争，决定着算力时代的国家竞争力版图。',
    related: ['containerization', 'second-law', 'turing-machine'],
    furtherReading: [
      read('photolithography', 'Photolithography — Wikipedia'),
      read('EUV lithography', 'EUV 光刻三十年攻坚'),
    ],
  },
  {
    id: 'reinforcement-learning',
    title: '强化学习',
    enTitle: 'Reinforcement Learning',
    category: 'technology',
    gravity: 2,
    summary:
      '不告诉机器答案，只告诉它奖惩——让智能体在一次次试错中自己学会策略。从 AlphaGo 击败李世石，到用人类反馈微调大语言模型，强化学习反复证明：给定足够的环境与算力，"会自学"的机器能抵达人类从未走过的棋路。',
    related: ['transformer', 'existentialism', 'turing-machine'],
    furtherReading: [
      read('reinforcement learning', 'Reinforcement learning — Wikipedia'),
      read('AlphaGo', 'AlphaGo 的技术解剖'),
    ],
  },
  // ── 人文 Humanity ─────────────────────────────────────────────
  {
    id: 'chunqiu-style',
    title: '春秋笔法',
    enTitle: 'Chunqiu Rhetoric',
    category: 'humanity',
    gravity: 3,
    summary:
      '一字褒贬之间，藏着中国最早的话语权术。孔子修《春秋》，用"弑"与"杀"、"伐"与"侵"的微妙差别为历史定性，让史笔本身成为审判。这种微言大义的传统塑造了此后两千年中文写作的含蓄基因，也提醒我们：叙述从来都不是中立的。',
    related: ['oral-tradition', 'impressionism', 'mean-doctrine'],
    furtherReading: [
      read('Spring and Autumn Annals', 'Spring and Autumn Annals — Wikipedia'),
      read('Chunqiu bifa', '微言大义：春秋笔法研究'),
    ],
  },
  {
    id: 'silk-road',
    title: '丝绸之路',
    enTitle: 'The Silk Road',
    category: 'humanity',
    gravity: 2,
    summary:
      '横贯欧亚的并非一条商路，而是一张流动的交换网络：丝绸西去，佛经东来，葡萄、造纸术与黑死病同路而行。丝绸之路证明了文明的活力恰恰来自边界地带的混血——敦煌壁画上希腊式的飞天，就是这张网最美的结点。',
    related: ['dunhuang-murals', 'great-voyages', 'tcp-ip', 'printing-revolution'],
    furtherReading: [
      read('Silk Road', 'Silk Road — Wikipedia'),
      read('Dunhuang Mogao', '敦煌莫高窟：丝路上的美术馆'),
    ],
  },
  {
    id: 'printing-revolution',
    title: '印刷术革命',
    enTitle: 'Printing Revolution',
    category: 'humanity',
    gravity: 2,
    summary:
      '古腾堡的活字让一本书的成本骤降三百倍，知识第一次挣脱了抄写员的手。宗教改革、科学革命与公共舆论的兴起，背后都是印刷机的齿轮声。媒介从来不只是容器——它重新组织了谁有资格说话、以及说什么话。',
    related: ['chunqiu-style', 'ukiyo-e', 'blockchain', 'oral-tradition'],
    furtherReading: [
      read('printing press', 'Printing press — Wikipedia'),
      read('printing revolution', '作为动因的印刷机'),
    ],
  },
  {
    id: 'imperial-examination',
    title: '科举制度',
    enTitle: 'Imperial Examination',
    category: 'humanity',
    gravity: 1,
    summary:
      '绵延一千三百年的考试选官制度：以四书五经为唯一考纲，向寒门打开了一条狭窄但真实的上升通道。它缔造了世界最早的文官体系，也把整个社会的智识资源锁定在唯一的评价标准里——流动与僵化，是同一枚铜板的两面。',
    related: ['aristocracy-exam', 'chunqiu-style', 'polis-democracy'],
    furtherReading: [
      read('imperial examination', 'Imperial examination — Wikipedia'),
      read('eight-legged essay', '八股文：形式如何吞噬内容'),
    ],
  },
  {
    id: 'polis-democracy',
    title: '城邦民主',
    enTitle: 'Polis Democracy',
    category: 'humanity',
    gravity: 1,
    summary:
      '在雅典的公民广场上，抽签与辩论取代了血统与刀剑。城邦民主把"政治"定义为公民共同的事务，也暴露了它的边界：奴隶、女性与外邦人被排除在公民之外。这场两千五百年前的实验留下的问题——谁有资格参与——至今没有标准答案。',
    related: ['imperial-examination', 'allegory-of-cave', 'existentialism'],
    furtherReading: [
      read('Athenian democracy', 'Athenian democracy — Wikipedia'),
      read('sortition', '抽签制：被遗忘的民主工具'),
    ],
  },
  {
    id: 'great-voyages',
    title: '大航海时代',
    enTitle: 'Age of Discovery',
    category: 'humanity',
    gravity: 1,
    summary:
      '十五世纪起，欧洲船队驶入未知的洋面，世界第一次被连成一张海图。香料、白银与作物的全球流动改写了每个大陆的餐桌与国库，也把殖民、奴役与生态交换的阴影刻进现代世界的地基。全球化的光荣与代价，自此同源而生。',
    related: ['silk-road', 'plate-tectonics', 'coral-bleaching'],
    furtherReading: [
      read('Age of Discovery', 'Age of Discovery — Wikipedia'),
      read('Columbian exchange', '哥伦布大交换'),
    ],
  },
  {
    id: 'aristocracy-exam',
    title: '科举与门阀',
    enTitle: 'Examination vs. Aristocracy',
    category: 'humanity',
    gravity: 1,
    summary:
      '门阀士族靠血统垄断仕途，科举则以考卷冲击血缘——中古中国政治的主线，就是这两种选拔逻辑长达数百年的拉锯。黄巢之乱与印刷术的普及最终压垮了门阀，但"精英再生产"的难题换了个面孔延续至今。',
    related: ['imperial-examination', 'printing-revolution', 'polis-democracy'],
    furtherReading: [
      read('Nine-rank system', 'Nine-rank system — Wikipedia'),
      read('medieval Chinese aristocracy', '中古门阀研究'),
    ],
  },
  {
    id: 'oral-tradition',
    title: '口述传统',
    enTitle: 'Oral Tradition',
    category: 'humanity',
    gravity: 1,
    summary:
      '在文字之前，人类用吟唱、韵律与故事把记忆存进声音里。荷马史诗的程式化句式、格萨尔王的世代传唱，证明口传不是文字的简陋前身，而是另一套精密的文化存储技术——它易逝，却也因此活着。',
    related: ['chunqiu-style', 'printing-revolution', 'silk-road'],
    furtherReading: [
      read('oral tradition', 'Oral tradition — Wikipedia'),
      read('oral formulaic composition', '帕里-洛德理论：口头程式'),
    ],
  },
  // ── 艺术 Art ──────────────────────────────────────────────────
  {
    id: 'impressionism',
    title: '印象派',
    enTitle: 'Impressionism',
    category: 'art',
    gravity: 3,
    summary:
      '莫奈们用光影的瞬间，反叛了三百年的画室规则。1874 年那场被嘲讽的展览，把画布从神话与历史搬到了户外的阳光里：看得见的笔触、未调和的颜色、稍纵即逝的瞬间。印象派教给世界的不是画法，而是一种观看方式——真实存在于光的变化之中。',
    related: ['ukiyo-e', 'montage', 'minimalism', 'chunqiu-style'],
    furtherReading: [
      read('Impressionism', 'Impressionism — Wikipedia'),
      read('Salon des Refusés', '落选者沙龙：1874 年的反叛'),
    ],
  },
  {
    id: 'bronze-patterns',
    title: '青铜器纹样',
    enTitle: 'Bronze Ritual Patterns',
    category: 'art',
    gravity: 1,
    summary:
      '饕餮纹的双眼在礼器上凝视了三千年。商周青铜纹样不是装饰，而是权力与神灵之间的视觉契约：狰狞的兽面震慑观者，回旋的云雷纹暗示宇宙秩序。在这些沉默的铜绿之下，藏着中国艺术最早的抽象语言。',
    related: ['dunhuang-murals', 'gothic-cathedral', 'mean-doctrine'],
    furtherReading: [
      read('taotie', 'Taotie — Wikipedia'),
      read('Chinese ritual bronzes', '商周青铜礼器'),
    ],
  },
  {
    id: 'montage',
    title: '蒙太奇',
    enTitle: 'Montage',
    category: 'art',
    gravity: 2,
    summary:
      '两个镜头相撞，诞生出二者都不具备的第三种意义。爱森斯坦把剪辑从技术升华为哲学：电影的表意不在画面之内，而在画面之间。蒙太奇重塑了二十世纪人类的感知方式，今天的短视频时代，我们每秒都在消费它。',
    related: ['impressionism', 'transformer', 'allegory-of-cave'],
    furtherReading: [
      read('montage (filmmaking)', 'Montage — Wikipedia'),
      read('Kuleshov effect', '库里肖夫效应'),
    ],
  },
  {
    id: 'gothic-cathedral',
    title: '哥特教堂',
    enTitle: 'Gothic Cathedral',
    category: 'art',
    gravity: 1,
    summary:
      '用石头对抗重力，用玻璃收藏光。飞扶拱把墙体的重量卸到半空，让整面墙化作彩窗——中世纪的神学家相信光即是神圣，哥特教堂就是一座为光建造的几何机器。它是信仰，也是那个时代最大胆的结构工程。',
    related: ['bronze-patterns', 'turing-machine', 'minimalism'],
    furtherReading: [
      read('Gothic architecture', 'Gothic architecture — Wikipedia'),
      read('Chartres Cathedral', '沙特尔大教堂的光'),
    ],
  },
  {
    id: 'ukiyo-e',
    title: '浮世绘',
    enTitle: 'Ukiyo-e',
    category: 'art',
    gravity: 2,
    summary:
      '江户的市井艺术，却震动了整个巴黎。葛饰北斋的巨浪与歌川广重的雨丝，以平面构图、大胆留白和日常题材，为困于透视法的欧洲画家打开了另一扇窗——印象派的色彩革命里，流淌着浮世绘的血。',
    related: ['impressionism', 'silk-road', 'montage'],
    furtherReading: [
      read('ukiyo-e', 'Ukiyo-e — Wikipedia'),
      read('Japonism', '日本主义：浮世绘如何征服欧洲'),
    ],
  },
  {
    id: 'minimalism',
    title: '极简主义',
    enTitle: 'Minimalism',
    category: 'art',
    gravity: 2,
    summary:
      '少，不是贫乏，而是抵抗。从马列维奇的黑方块到贾德的金属箱，极简主义剥去再现与叙事，让物体、空间与观看者本身成为作品。它提出的追问延续至今：当一切都被拿走，剩下的那个"在场"还是艺术吗？',
    related: ['impressionism', 'gothic-cathedral', 'occams-razor'],
    furtherReading: [
      read('minimalism (visual arts)', 'Minimalism — Wikipedia'),
      read('Donald Judd specific objects', '贾德：特殊物体'),
    ],
  },
  {
    id: 'dunhuang-murals',
    title: '敦煌壁画',
    enTitle: 'Dunhuang Murals',
    category: 'art',
    gravity: 2,
    summary:
      '大漠深处的一千年画廊：四百九十二个洞窟、四万五千平方米壁画，希腊的裸体、波斯的纹样与中原的线描在同一面墙上相遇。敦煌是丝绸之路留给世界的视觉档案馆，每一层剥落的颜料下，都是一次文明的握手。',
    related: ['silk-road', 'bronze-patterns', 'ukiyo-e'],
    furtherReading: [
      read('Mogao Caves', 'Mogao Caves — Wikipedia'),
      read('Digital Dunhuang', '数字敦煌计划'),
    ],
  },
  {
    id: 'twelve-tone',
    title: '十二平均律',
    enTitle: 'Twelve-tone Equal Temperament',
    category: 'art',
    gravity: 1,
    summary:
      '把八度平均切成十二份，用一点音准的妥协换取自由转调的可能。明代朱载堉在 1584 年用算盘率先算出精确的律数，比欧洲早了半个世纪。这套数学化的音高系统是钢琴、和弦与整个西方和声体系得以存在的隐形地基。',
    related: ['montage', 'mean-doctrine', 'turing-machine'],
    furtherReading: [
      read('equal temperament', 'Equal temperament — Wikipedia'),
      read('Zhu Zaiyu', '朱载堉与律历融通'),
    ],
  },
  // ── 哲学 Philosophy ───────────────────────────────────────────
  {
    id: 'ship-of-theseus',
    title: '忒修斯之船',
    enTitle: 'Ship of Theseus',
    category: 'philosophy',
    gravity: 3,
    summary:
      '换完所有木板的船，还是原来那艘吗？如果把旧木板重新拼成一艘，哪艘才是真的？这个两千年前的谜题追问"同一性"的本质，并在今天变得前所未有地切身：全身细胞七年一换的你，上传了意识的机器，被修复一半的古城——"还是原来那个"究竟意味着什么？',
    related: ['existentialism', 'zhuangzi-butterfly', 'quantum-entanglement', 'crispr'],
    furtherReading: [
      read('ship of Theseus', 'Ship of Theseus — Wikipedia'),
      read('personal identity', '人格同一性争论'),
    ],
  },
  {
    id: 'allegory-of-cave',
    title: '洞穴寓言',
    enTitle: 'Allegory of the Cave',
    category: 'philosophy',
    gravity: 2,
    summary:
      '囚徒一生只见过墙上的影子，便把影子当作全部的真实。柏拉图用这个寓言描述启蒙的痛苦与代价：挣脱锁链的人会被光刺痛，回到洞穴的人会被同伴嘲笑。在算法投喂的时代，这个寓言从未如此锋利——你确定自己看到的不是影子吗？',
    related: ['skepticism', 'montage', 'polis-democracy', 'speed-of-light'],
    furtherReading: [
      read('allegory of the cave', 'Allegory of the cave — Wikipedia'),
      read('Plato Republic', '《理想国》第七卷'),
    ],
  },
  {
    id: 'existentialism',
    title: '存在主义',
    enTitle: 'Existentialism',
    category: 'philosophy',
    gravity: 2,
    summary:
      '存在先于本质：人不是被设计好的产品，而是被抛入世界、不得不自己定义自己的自由。萨特的这句宣言诞生于二战后的废墟，却回应了每个时代的虚无——当意义不再从天而降，"选择"本身成为人最后的、无法推卸的重负。',
    related: ['ship-of-theseus', 'skepticism', 'reinforcement-learning', 'mean-doctrine'],
    furtherReading: [
      read('existentialism', 'Existentialism — Wikipedia'),
      read('Sartre existentialism is a humanism', '萨特《存在主义是一种人道主义》'),
    ],
  },
  {
    id: 'zhuangzi-butterfly',
    title: '庄周梦蝶',
    enTitle: 'Zhuangzi\'s Butterfly Dream',
    category: 'philosophy',
    gravity: 2,
    summary:
      '昔者庄周梦为胡蝶，栩栩然胡蝶也；不知周之梦为胡蝶与，胡蝶之梦为周与？庄子用一个轻盈的梦境拆掉了真实与虚幻之间的墙。它既是中国哲学最美的怀疑论，也预言了从笛卡尔到虚拟现实的所有"缸中之脑"式追问。',
    related: ['skepticism', 'allegory-of-cave', 'schrodinger-equation'],
    furtherReading: [
      read('Zhuangzi (book)', 'Zhuangzi — Wikipedia'),
      read('dream argument', '梦论证：从庄子到笛卡尔'),
    ],
  },
  {
    id: 'occams-razor',
    title: '奥卡姆剃刀',
    enTitle: "Occam's Razor",
    category: 'philosophy',
    gravity: 1,
    summary:
      '如无必要，勿增实体。这把中世纪的剃刀至今仍是科学的第一审美原则：在两个解释力相当的理论之间，选择假设更少的那个。它不保证真理，却是一种高效的求知纪律——从行星轨道到机器学习，简洁一再战胜繁复。',
    related: ['skepticism', 'dark-matter', 'minimalism', 'turing-machine'],
    furtherReading: [
      read("Occam's razor", "Occam's razor — Wikipedia"),
      read('overfitting', '过拟合：剃刀的机器学习版本'),
    ],
  },
  {
    id: 'trolley-problem',
    title: '电车难题',
    enTitle: 'The Trolley Problem',
    category: 'philosophy',
    gravity: 2,
    summary:
      '扳动道岔可以救五个人，但会牺牲一个无辜者——你扳吗？这个思想实验把功利主义与义务论的张力压进一个扳道器。当自动驾驶汽车必须在毫秒之间做出同类选择，哲学家与工程师第一次不得不共用同一张答卷。',
    related: ['existentialism', 'reinforcement-learning', 'crispr'],
    furtherReading: [
      read('trolley problem', 'Trolley problem — Wikipedia'),
      read('Moral Machine experiment', 'MIT 道德机器实验'),
    ],
  },
  {
    id: 'mean-doctrine',
    title: '中庸',
    enTitle: 'The Doctrine of the Mean',
    category: 'philosophy',
    gravity: 1,
    summary:
      '"中"不是折中主义，而是恰在其位的动态平衡；"庸"不是平庸，而是恒常日用之道。中庸要求在不断变化的情境中拿捏那个恰到好处的点——它比任何极端立场都更难，因为极端只需要勇气，而中道还需要智慧。',
    related: ['existentialism', 'chunqiu-style', 'bronze-patterns', 'twelve-tone'],
    furtherReading: [
      read('Doctrine of the Mean', 'Doctrine of the Mean — Wikipedia'),
      read('Aristotle golden mean', '亚里士多德的中道对照'),
    ],
  },
  {
    id: 'skepticism',
    title: '怀疑论',
    enTitle: 'Skepticism',
    category: 'philosophy',
    gravity: 1,
    summary:
      '我们真的能知道任何事吗？从皮浪到休谟，怀疑论者系统性地拆解知识的根基：感官会欺骗，归纳无逻辑担保，因果也许只是习惯。怀疑论不是答案，而是哲学最锋利的清洁剂——它逼出了笛卡尔的"我思"与科学的方法论自觉。',
    related: ['allegory-of-cave', 'zhuangzi-butterfly', 'occams-razor', 'dark-matter'],
    furtherReading: [
      read('philosophical skepticism', 'Philosophical skepticism — Wikipedia'),
      read('problem of induction', '休谟的归纳问题'),
    ],
  },
  // ── 自然 Nature ───────────────────────────────────────────────
  {
    id: 'coral-bleaching',
    title: '珊瑚白化',
    enTitle: 'Coral Bleaching',
    category: 'nature',
    gravity: 3,
    summary:
      '海洋升温 1°C，一座水下城市如何失去颜色。珊瑚与虫黄藻的共生关系维持了数亿年，而持续的热浪会让珊瑚驱逐自己的房客，露出森森白骨。占据海洋面积不足 1% 的珊瑚礁养育了四分之一的海洋物种——它们的白化，是整个生态系统的体温计。',
    related: ['photosynthesis', 'mycorrhizal-network', 'great-voyages'],
    furtherReading: [
      read('coral bleaching', 'Coral bleaching — Wikipedia'),
      read('Great Barrier Reef bleaching', '大堡礁白化事件记录'),
    ],
  },
  {
    id: 'photosynthesis',
    title: '光合作用',
    enTitle: 'Photosynthesis',
    category: 'nature',
    gravity: 2,
    summary:
      '地球上几乎所有生命的能量源头：把阳光、水与二氧化碳编织成糖，顺手改变了整个行星的大气成分。二十多亿年前蓝藻的这场化学革命曾引发大氧化事件，灭绝了无数厌氧生命——我们今天呼吸的每一口氧气，都是那次远古"污染"的遗产。',
    related: ['coral-bleaching', 'second-law', 'crispr', 'hydrothermal-vent'],
    furtherReading: [
      read('photosynthesis', 'Photosynthesis — Wikipedia'),
      read('Great Oxidation Event', '大氧化事件'),
    ],
  },
  {
    id: 'mycorrhizal-network',
    title: '菌根网络',
    enTitle: 'Mycorrhizal Network',
    category: 'nature',
    gravity: 2,
    summary:
      '森林的地下互联网：真菌菌丝把一棵棵树的根连成网络，糖类、氮磷与警报信号在其间交换。母树通过它哺育幼苗，受攻击的树通过它向邻居示警。"木联网"的发现动摇了把森林看作个体竞争剧场的旧图景——合作，原来写在土壤之下。',
    related: ['coral-bleaching', 'photosynthesis', 'tcp-ip', 'mimicry'],
    furtherReading: [
      read('mycorrhizal network', 'Mycorrhizal network — Wikipedia'),
      read('Suzanne Simard mother tree', '苏珊娜·西马德与"母树"研究'),
    ],
  },
  {
    id: 'migration-navigation',
    title: '迁徙导航',
    enTitle: 'Animal Migration Navigation',
    category: 'nature',
    gravity: 1,
    summary:
      '北极燕鸥每年往返两极飞行七万公里，帝王蝶四代接力完成祖辈未竟的旅程。候鸟眼里的地磁感应、星空罗盘与嗅觉地图，构成一套人类至今未能完全破译的多模态导航系统——量子纠缠，可能正是其中的物理基础之一。',
    related: ['aurora', 'lidar', 'quantum-entanglement'],
    furtherReading: [
      read('animal migration', 'Animal migration — Wikipedia'),
      read('magnetoreception', '磁感应：动物的第六感'),
    ],
  },
  {
    id: 'mimicry',
    title: '拟态',
    enTitle: 'Mimicry',
    category: 'nature',
    gravity: 1,
    summary:
      '无毒的蝴蝶穿上毒蝶的外衣，兰花把自己伪装成雌蜂的模样。拟态是演化写就的欺骗艺术：捕食者的眼睛成为自然选择的画师，一笔一笔把弱者描成强者的样子。它提醒我们，在生命世界里，"看起来是"有时比"真的是"更重要。',
    related: ['mycorrhizal-network', 'ukiyo-e', 'allegory-of-cave'],
    furtherReading: [
      read('mimicry', 'Mimicry — Wikipedia'),
      read('Batesian mimicry', '贝氏拟态与穆氏拟态'),
    ],
  },
  {
    id: 'hydrothermal-vent',
    title: '深海热泉',
    enTitle: 'Hydrothermal Vent',
    category: 'nature',
    gravity: 1,
    summary:
      '在永夜的海底，黑色烟囱喷吐着 400°C 的矿液，周围却聚集着不依赖阳光的整套生态系统：化能合成细菌替代了光合作用，成为食物链的基底。深海热泉改写了"生命需要阳光"的教条，也成为生命起源假说最有力的候选现场。',
    related: ['photosynthesis', 'plate-tectonics', 'aurora'],
    furtherReading: [
      read('hydrothermal vent', 'Hydrothermal vent — Wikipedia'),
      read('origin of life alkaline vent', '生命起源的热泉假说'),
    ],
  },
  {
    id: 'aurora',
    title: '极光',
    enTitle: 'Aurora',
    category: 'nature',
    gravity: 1,
    summary:
      '太阳风中的带电粒子沿地磁力线冲入两极大气，与氧氮原子碰撞出绿色与紫红的光幕。极光是行星磁场存在的可见证据——那层看不见的盾牌每夜都在头顶起舞，提醒我们：没有地磁场，大气与生命都将暴露在恒星风的吹蚀之下。',
    related: ['migration-navigation', 'plate-tectonics', 'hydrothermal-vent'],
    furtherReading: [
      read('aurora', 'Aurora — Wikipedia'),
      read('Earth magnetosphere', '地球磁层简史'),
    ],
  },
  {
    id: 'cicada-prime',
    title: '蝉的质数周期',
    enTitle: "Cicadas' Prime-numbered Cycles",
    category: 'nature',
    gravity: 1,
    summary:
      '北美的周期蝉在地下蛰伏 13 年或 17 年后同步破土——为什么偏偏是质数？因为质数周期让任何短周期天敌都难以与之同步：2 年一代的捕食者要等 26 年才能再遇 13 年蝉。数论，就这样被自然选择写进了昆虫的生命节律。',
    related: ['mimicry', 'occams-razor', 'migration-navigation'],
    furtherReading: [
      read('periodical cicadas', 'Periodical cicadas — Wikipedia'),
      read('prime number cicadas evolution', '质数周期的演化博弈解释'),
    ],
  },
]

export const NODE_MAP: Record<string, KnowledgeNode> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
)

/** 本周亮点节点（首页 Section 4 与 featured 排序共用） */
export const FEATURED_IDS = [
  'quantum-entanglement',
  'transformer',
  'chunqiu-style',
  'impressionism',
  'ship-of-theseus',
  'coral-bleaching',
] as const

/** 去重后的连线对 [a, b] */
export const EDGES: [string, string][] = (() => {
  const seen = new Set<string>()
  const edges: [string, string][] = []
  for (const n of NODES) {
    for (const r of n.related) {
      if (!NODE_MAP[r]) continue
      const key = [n.id, r].sort().join('|')
      if (!seen.has(key)) {
        seen.add(key)
        edges.push([n.id, r])
      }
    }
  }
  return edges
})()

export function nodesByCategory(id: CategoryId): KnowledgeNode[] {
  return NODES.filter((n) => n.category === id)
}
