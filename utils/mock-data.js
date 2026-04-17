/**
 * Mock data for the entire app
 * Used to make the app feel complete without backend dependency
 */

// ============ Banner ============
export const bannerList = [
  {
    id: 'b1',
    image: 'https://picsum.photos/750/340?random=1',
    title: '双眼皮手术全攻略',
    link: 'article',
    articleId: 'a1'
  },
  {
    id: 'b2',
    image: 'https://picsum.photos/750/340?random=2',
    title: '春季护肤指南',
    link: 'article',
    articleId: 'a5'
  },
  {
    id: 'b3',
    image: 'https://picsum.photos/750/340?random=3',
    title: '免费领取医美咨询名额',
    link: 'form',
    articleId: ''
  }
]

// ============ Categories ============
export const categoryList = [
  { value: 'all', label: '全部', icon: 'color' },
  { value: 'double_eyelid', label: '双眼皮', icon: 'eye' },
  { value: 'skin_care', label: '皮肤管理', icon: 'star' },
  { value: 'nose', label: '鼻部整形', icon: 'heart' },
  { value: 'face', label: '面部轮廓', icon: 'person' },
  { value: 'dental', label: '口腔美容', icon: 'smile' },
  { value: 'body', label: '形体塑造', icon: 'fire' },
  { value: 'anti_aging', label: '抗衰老', icon: 'clock' }
]

// ============ Articles ============
export const articleList = [
  {
    _id: 'a1',
    title: '双眼皮手术前必读：全切、埋线、韩式三点怎么选？',
    summary: '双眼皮手术是最常见的眼部整形项目之一，不同术式适合不同眼型。本文详细解析三种主流术式的优缺点，帮你做出最适合的选择。',
    cover_image: 'https://picsum.photos/400/300?random=10',
    category: 'double_eyelid',
    author: '张医生',
    read_count: 12580,
    like_count: 342,
    create_time: Date.now() - 86400000,
    content: `<h2>什么是双眼皮手术？</h2>
<p>双眼皮手术（重睑术）是通过手术方式在上眼睑形成双眼皮皱褶的美容手术。目前主流的术式有三种：全切双眼皮、埋线双眼皮和韩式三点定位。</p>

<h2>一、全切双眼皮</h2>
<p><strong>适合人群：</strong>上眼睑皮肤松弛、脂肪较多、肿眼泡的求美者。</p>
<p><strong>优点：</strong></p>
<ul>
<li>效果持久，基本不会回弹</li>
<li>可同时去除多余皮肤和脂肪</li>
<li>适用范围广，几乎所有眼型都可以做</li>
</ul>
<p><strong>缺点：</strong></p>
<ul>
<li>恢复期较长，约需1-3个月</li>
<li>早期疤痕较明显</li>
<li>如果不满意，修复难度较大</li>
</ul>
<p><strong>恢复时间：</strong>术后7天拆线，1个月消肿明显，3-6个月基本自然。</p>

<h2>二、埋线双眼皮</h2>
<p><strong>适合人群：</strong>眼皮薄、脂肪少、皮肤紧致的年轻求美者。</p>
<p><strong>优点：</strong></p>
<ul>
<li>创伤小，恢复快</li>
<li>不留明显疤痕</li>
<li>效果不满意可取出</li>
</ul>
<p><strong>缺点：</strong></p>
<ul>
<li>维持时间有限，可能3-5年后松脱</li>
<li>不能去除多余皮肤和脂肪</li>
<li>不适合眼皮条件差的人</li>
</ul>
<p><strong>恢复时间：</strong>约1-2周基本消肿，1个月自然。</p>

<h2>三、韩式三点</h2>
<p><strong>适合人群：</strong>眼部条件中等，想要自然效果的求美者。</p>
<p><strong>优点：</strong></p>
<ul>
<li>介于全切和埋线之间</li>
<li>可适当去除脂肪</li>
<li>恢复比全切快</li>
</ul>
<p><strong>缺点：</strong></p>
<ul>
<li>不能去除多余皮肤</li>
<li>效果持久性不如全切</li>
</ul>

<h2>如何选择？</h2>
<p>选择术式时需要综合考虑：</p>
<ol>
<li><strong>眼部基础条件：</strong>皮肤薄紧选埋线，松弛有脂肪选全切</li>
<li><strong>对恢复期的接受度：</strong>急于恢复选埋线，不怕等选全切</li>
<li><strong>对持久性的要求：</strong>追求一劳永逸选全切</li>
<li><strong>预算：</strong>全切 > 韩式三点 > 埋线</li>
</ol>

<h2>术前注意事项</h2>
<ul>
<li>术前两周停用阿司匹林等抗凝药物</li>
<li>女性避开月经期</li>
<li>术前做好眼部检查，排除干眼症等问题</li>
<li>与医生充分沟通期望效果</li>
</ul>

<p><em>本文仅供科普参考，具体方案请咨询专业医生。</em></p>`
  },
  {
    _id: 'a2',
    title: '埋线双眼皮能维持多久？术后护理全攻略',
    summary: '埋线双眼皮以创伤小、恢复快著称，但很多人担心维持时间。本文从术后护理角度，教你如何让效果更持久。',
    cover_image: 'https://picsum.photos/400/300?random=11',
    category: 'double_eyelid',
    author: '李医生',
    read_count: 8920,
    like_count: 256,
    create_time: Date.now() - 172800000,
    content: `<h2>埋线双眼皮的维持时间</h2>
<p>一般来说，埋线双眼皮的维持时间在3-7年不等，具体取决于个人体质、眼部条件和术后护理。部分人可以维持更长时间，甚至终身不变。</p>

<h2>影响维持时间的因素</h2>
<ol>
<li><strong>眼皮厚度：</strong>眼皮越薄，维持时间越长</li>
<li><strong>埋线技术：</strong>连续埋线比间断埋线更牢固</li>
<li><strong>术后护理：</strong>正确护理可以延长维持时间</li>
<li><strong>个人习惯：</strong>频繁揉眼会加速松脱</li>
</ol>

<h2>术后护理要点</h2>
<h3>术后1-3天</h3>
<ul>
<li>冷敷消肿：每次15-20分钟，每天3-4次</li>
<li>保持伤口清洁干燥</li>
<li>睡觉时适当垫高枕头</li>
</ul>

<h3>术后4-7天</h3>
<ul>
<li>可以改为热敷，促进血液循环</li>
<li>开始轻柔清洁眼部</li>
<li>避免剧烈运动</li>
</ul>

<h3>术后1-3个月</h3>
<ul>
<li>避免揉搓眼睛</li>
<li>不要佩戴美瞳或隐形眼镜</li>
<li>注意防晒，防止色素沉着</li>
</ul>

<p><em>如果发现双眼皮变浅或消失，不要着急，可以咨询医生是否需要补做。</em></p>`
  },
  {
    _id: 'a3',
    title: '光子嫩肤值不值得做？皮肤科医生告诉你真相',
    summary: '光子嫩肤号称"午餐美容"，30分钟就能改善肤质。它真的那么神奇吗？哪些人适合做？多久做一次？',
    cover_image: 'https://picsum.photos/400/300?random=12',
    category: 'skin_care',
    author: '王医生',
    read_count: 15670,
    like_count: 523,
    create_time: Date.now() - 259200000,
    content: `<h2>什么是光子嫩肤？</h2>
<p>光子嫩肤（IPL，强脉冲光）是利用宽光谱脉冲光照射皮肤，通过选择性光热作用，达到改善肤质的效果。它可以同时处理多种皮肤问题。</p>

<h2>光子嫩肤能解决什么问题？</h2>
<ul>
<li><strong>色斑：</strong>雀斑、晒斑、老年斑</li>
<li><strong>红血丝：</strong>面部潮红、毛细血管扩张</li>
<li><strong>毛孔粗大：</strong>通过刺激胶原再生来收缩毛孔</li>
<li><strong>肤色不均：</strong>改善暗沉，提亮肤色</li>
<li><strong>细纹：</strong>轻度改善浅表细纹</li>
</ul>

<h2>治疗过程</h2>
<ol>
<li>清洁面部，涂抹冷凝胶</li>
<li>佩戴护目镜</li>
<li>医生根据肤质调整参数</li>
<li>脉冲光照射，每次会有轻微弹跳感</li>
<li>全程约20-30分钟</li>
<li>术后涂抹修复霜和防晒</li>
</ol>

<h2>多久做一次？</h2>
<p>一般建议每3-4周做一次，初始疗程3-5次。之后每3-6个月维护一次即可。</p>

<h2>术后注意事项</h2>
<ul>
<li>严格防晒！这是最重要的一点</li>
<li>术后可能出现轻微发红，属正常反应</li>
<li>色斑处可能变深结痂，一周左右自然脱落</li>
<li>一周内避免使用含酸类护肤品</li>
<li>加强保湿</li>
</ul>

<p><em>光子嫩肤虽然安全性高，但仍需在正规医疗机构由专业医生操作。</em></p>`
  },
  {
    _id: 'a4',
    title: '玻尿酸隆鼻和假体隆鼻，到底哪个更适合你？',
    summary: '隆鼻是面部整形中最热门的项目之一。玻尿酸注射和假体植入各有优劣，如何选择？一文读懂。',
    cover_image: 'https://picsum.photos/400/300?random=13',
    category: 'nose',
    author: '刘医生',
    read_count: 11340,
    like_count: 389,
    create_time: Date.now() - 345600000,
    content: `<h2>两种隆鼻方式对比</h2>

<h3>玻尿酸注射隆鼻</h3>
<p><strong>原理：</strong>通过注射透明质酸（玻尿酸）填充鼻背、鼻尖，改善鼻型。</p>
<p><strong>优点：</strong></p>
<ul>
<li>无需手术，注射即可</li>
<li>即刻见效</li>
<li>不满意可用溶解酶溶解</li>
<li>恢复期短，几乎无需休息</li>
</ul>
<p><strong>缺点：</strong></p>
<ul>
<li>维持6-12个月，需要反复注射</li>
<li>改善幅度有限</li>
<li>有血管栓塞风险（需专业医生操作）</li>
<li>长期费用可能超过手术</li>
</ul>

<h3>假体隆鼻</h3>
<p><strong>原理：</strong>通过手术将硅胶或膨体假体植入鼻背。</p>
<p><strong>优点：</strong></p>
<ul>
<li>效果持久</li>
<li>可塑性强，改善幅度大</li>
<li>一次手术，长期受益</li>
</ul>
<p><strong>缺点：</strong></p>
<ul>
<li>需要手术，有恢复期</li>
<li>可能出现假体透光、移位</li>
<li>修复需再次手术</li>
</ul>

<h2>如何选择？</h2>
<p>如果你的鼻部基础较好，只需要轻微调整，选玻尿酸。如果需要明显改善鼻型，选假体手术。</p>

<p><em>无论选择哪种方式，请务必选择正规医疗机构和经验丰富的医生。</em></p>`
  },
  {
    _id: 'a5',
    title: '刷酸入门指南：水杨酸、果酸、壬二酸怎么选？',
    summary: '刷酸是护肤界的热门话题，但用不好容易烂脸。这篇入门指南教你如何科学刷酸，少走弯路。',
    cover_image: 'https://picsum.photos/400/300?random=14',
    category: 'skin_care',
    author: '陈医生',
    read_count: 20150,
    like_count: 867,
    create_time: Date.now() - 432000000,
    content: `<h2>什么是刷酸？</h2>
<p>刷酸是指使用含有一定浓度酸类成分的产品涂抹在皮肤上，通过化学作用促进角质层代谢，改善皮肤问题。</p>

<h2>常见酸类对比</h2>

<h3>水杨酸（BHA）</h3>
<p><strong>适合：</strong>油皮、痘痘肌、黑头</p>
<p>水杨酸是脂溶性酸，可以深入毛孔溶解油脂，特别适合控油和清洁毛孔。日常护肤浓度一般在0.5%-2%。</p>

<h3>果酸（AHA）</h3>
<p><strong>适合：</strong>暗沉、粗糙、浅色斑</p>
<p>果酸是水溶性酸，主要作用于皮肤表面，能够加速角质脱落，促进细胞更新。常见的果酸有甘醇酸和乳酸。</p>

<h3>壬二酸</h3>
<p><strong>适合：</strong>痘印、色沉、玫瑰痤疮</p>
<p>壬二酸比较温和，具有抗炎和抑制黑色素的作用，适合敏感肌使用。</p>

<h2>刷酸注意事项</h2>
<ol>
<li>从低浓度开始，逐步建立耐受</li>
<li>刷酸期间必须做好防晒</li>
<li>不要同时使用多种酸</li>
<li>敏感期间停止刷酸</li>
<li>孕期哺乳期避免使用</li>
</ol>

<p><em>建议初次刷酸在医生指导下进行，尤其是高浓度果酸焕肤。</em></p>`
  },
  {
    _id: 'a6',
    title: '面部吸脂 vs 瘦脸针：大脸变小脸的两条路',
    summary: '脸大不一定是骨头大，可能是脂肪堆积或咬肌肥大。找对原因，选对方法，才能有效瘦脸。',
    cover_image: 'https://picsum.photos/400/300?random=15',
    category: 'face',
    author: '赵医生',
    read_count: 9870,
    like_count: 312,
    create_time: Date.now() - 518400000,
    content: `<h2>脸大的三种类型</h2>
<ul>
<li><strong>脂肪型：</strong>面颊脂肪堆积，适合面部吸脂</li>
<li><strong>肌肉型：</strong>咬肌肥大，适合瘦脸针</li>
<li><strong>骨骼型：</strong>下颌角宽大，需要削骨手术</li>
</ul>

<h2>瘦脸针（肉毒素注射）</h2>
<p>通过注射A型肉毒毒素使咬肌萎缩，从而达到瘦脸效果。</p>
<p><strong>维持时间：</strong>4-6个月</p>
<p><strong>注意：</strong>需要定期注射维持效果。</p>

<h2>面部吸脂</h2>
<p>通过微创手术吸出面颊多余脂肪。</p>
<p><strong>恢复期：</strong>约2-4周</p>
<p><strong>效果：</strong>较为持久，脂肪细胞不会再生。</p>

<p><em>建议先咨询专业医生判断脸大的原因，再选择合适的方案。</em></p>`
  },
  {
    _id: 'a7',
    title: '牙齿贴面：不磨牙也能拥有明星同款笑容',
    summary: '牙齿贴面是近年来最火的口腔美容项目。不用戴牙套，不用磨牙，就能让牙齿变白变整齐。',
    cover_image: 'https://picsum.photos/400/300?random=16',
    category: 'dental',
    author: '孙医生',
    read_count: 7650,
    like_count: 198,
    create_time: Date.now() - 604800000,
    content: `<h2>什么是牙齿贴面？</h2>
<p>牙齿贴面是在牙齿表面粘贴一层薄薄的瓷片或树脂材料，用来改善牙齿的颜色、形态和排列。</p>

<h2>贴面的种类</h2>
<ul>
<li><strong>瓷贴面：</strong>美观度高，耐久性好，使用寿命10-15年</li>
<li><strong>树脂贴面：</strong>价格较低，可修复，使用寿命5-7年</li>
</ul>

<h2>适合人群</h2>
<ul>
<li>牙齿发黄、四环素牙、氟斑牙</li>
<li>轻度牙齿不齐</li>
<li>牙缝过大</li>
<li>牙齿缺损</li>
</ul>

<h2>注意事项</h2>
<ul>
<li>贴面后避免啃咬硬物</li>
<li>注意口腔卫生</li>
<li>定期复查</li>
</ul>

<p><em>贴面并非适合所有人，严重错颌畸形仍需正畸治疗。</em></p>`
  },
  {
    _id: 'a8',
    title: '热玛吉 vs 超声刀：抗衰项目怎么选？',
    summary: '热玛吉和超声刀是目前最火的两大无创抗衰项目，它们的原理、效果和适合人群各有不同。',
    cover_image: 'https://picsum.photos/400/300?random=17',
    category: 'anti_aging',
    author: '周医生',
    read_count: 18900,
    like_count: 645,
    create_time: Date.now() - 691200000,
    content: `<h2>热玛吉</h2>
<p><strong>原理：</strong>利用射频能量加热皮肤深层，刺激胶原蛋白再生和收缩。</p>
<p><strong>适合：</strong>面部轻度松弛、想要紧致提升的人群。</p>
<p><strong>效果：</strong>即刻紧致感，2-3个月后效果最佳，维持1-2年。</p>

<h2>超声刀（HIFU）</h2>
<p><strong>原理：</strong>利用高强度聚焦超声波作用于SMAS筋膜层。</p>
<p><strong>适合：</strong>面部中度松弛、下垂明显的人群。</p>
<p><strong>效果：</strong>提升效果更明显，维持1-1.5年。</p>

<h2>如何选择？</h2>
<p>30-35岁、轻度松弛选热玛吉；35岁以上、松弛明显选超声刀。两者也可以联合使用。</p>

<p><em>请在正规医疗机构进行治疗，认准正品设备。</em></p>`
  },
  {
    _id: 'a9',
    title: '吸脂减肥靠谱吗？关于吸脂你必须知道的10件事',
    summary: '吸脂不是减肥！它是塑形手术。很多人对吸脂有误解，这篇文章帮你建立正确认知。',
    cover_image: 'https://picsum.photos/400/300?random=18',
    category: 'body',
    author: '吴医生',
    read_count: 13240,
    like_count: 421,
    create_time: Date.now() - 777600000,
    content: `<h2>吸脂的真相</h2>
<ol>
<li><strong>吸脂不等于减肥：</strong>吸脂是局部塑形，不是全身减重</li>
<li><strong>体重不会明显下降：</strong>脂肪密度低，体积大但重量轻</li>
<li><strong>不能替代运动和饮食：</strong>健康生活方式仍然是基础</li>
<li><strong>有恢复期：</strong>需要穿塑身衣1-3个月</li>
<li><strong>效果是长期的：</strong>成年人脂肪细胞数量基本固定，吸走不再生</li>
<li><strong>但可以反弹：</strong>剩余脂肪细胞仍可变大</li>
<li><strong>不适合所有人：</strong>BMI过高者应先减重</li>
<li><strong>选择医生很重要：</strong>吸脂均匀度直接影响效果</li>
<li><strong>常见部位：</strong>腰腹、大腿、手臂、双下巴</li>
<li><strong>风险存在：</strong>任何手术都有风险，需要充分了解</li>
</ol>

<p><em>吸脂手术请选择正规三甲医院或有资质的医疗美容机构。</em></p>`
  },
  {
    _id: 'a10',
    title: '医美项目价格指南：别再花冤枉钱了',
    summary: '医美项目价格差异大，同一个项目不同机构报价可能差数倍。教你看懂价格构成，避免踩坑。',
    cover_image: 'https://picsum.photos/400/300?random=19',
    category: 'skin_care',
    author: '靓人编辑部',
    read_count: 25600,
    like_count: 1024,
    create_time: Date.now() - 864000000,
    content: `<h2>常见项目参考价格</h2>
<p>以下为一线城市正规医疗机构参考价格区间：</p>
<ul>
<li><strong>双眼皮（全切）：</strong>6000-15000元</li>
<li><strong>双眼皮（埋线）：</strong>3000-8000元</li>
<li><strong>隆鼻（玻尿酸）：</strong>2000-8000元/次</li>
<li><strong>隆鼻（假体）：</strong>10000-30000元</li>
<li><strong>光子嫩肤：</strong>800-3000元/次</li>
<li><strong>热玛吉：</strong>10000-30000元/次</li>
<li><strong>瘦脸针：</strong>1500-4000元/次</li>
<li><strong>牙齿贴面：</strong>2000-8000元/颗</li>
</ul>

<h2>价格差异的原因</h2>
<ol>
<li>医生资历和经验</li>
<li>使用的材料和设备品牌</li>
<li>机构运营成本</li>
<li>地区差异</li>
</ol>

<h2>避坑建议</h2>
<ul>
<li>不要只看价格，便宜的可能用了不正规的材料</li>
<li>不要被"限时特价"冲昏头脑</li>
<li>多家对比，了解市场行情</li>
<li>查看机构资质和医生执照</li>
</ul>

<p><em>选择医美机构，安全和效果永远排在价格前面。</em></p>`
  },
  {
    _id: 'a11',
    title: '鼻综合手术：一次手术解决多个鼻部问题',
    summary: '鼻综合不是简单的隆鼻，而是针对鼻背、鼻尖、鼻翼、鼻小柱等多个部位进行综合改善。',
    cover_image: 'https://picsum.photos/400/300?random=20',
    category: 'nose',
    author: '刘医生',
    read_count: 8760,
    like_count: 287,
    create_time: Date.now() - 950400000,
    content: `<h2>什么是鼻综合？</h2>
<p>鼻综合手术是根据个人面部比例和鼻部条件，对鼻子进行全方位的设计和调整。</p>

<h2>可以改善的问题</h2>
<ul>
<li>鼻背低平 → 假体/自体软骨垫高</li>
<li>鼻尖圆钝 → 耳软骨或肋软骨塑形</li>
<li>鼻翼宽大 → 鼻翼缩小术</li>
<li>鼻小柱短 → 延长鼻小柱</li>
<li>朝天鼻 → 延长鼻尖</li>
</ul>

<h2>恢复过程</h2>
<p>术后7天拆线拆夹板，2-4周消肿明显，3-6个月定型。完全恢复需要约1年。</p>

<p><em>鼻综合是技术要求较高的手术，选择经验丰富的医生至关重要。</em></p>`
  },
  {
    _id: 'a12',
    title: '正畸科普：隐形牙套和钢丝牙套怎么选？',
    summary: '牙齿矫正不只是为了好看，更是为了口腔健康。了解不同矫正方式，选择最适合你的方案。',
    cover_image: 'https://picsum.photos/400/300?random=21',
    category: 'dental',
    author: '孙医生',
    read_count: 16300,
    like_count: 534,
    create_time: Date.now() - 1036800000,
    content: `<h2>牙齿矫正的方式</h2>

<h3>传统金属托槽（钢丝牙套）</h3>
<p><strong>优点：</strong>适用范围广，矫正力量强，价格相对低</p>
<p><strong>缺点：</strong>不美观，口腔不适感强</p>
<p><strong>价格：</strong>15000-30000元</p>

<h3>隐形矫正（如隐适美）</h3>
<p><strong>优点：</strong>美观，可摘戴，舒适度高</p>
<p><strong>缺点：</strong>对复杂病例效果有限，需要自律</p>
<p><strong>价格：</strong>25000-50000元</p>

<h3>舌侧矫正</h3>
<p><strong>优点：</strong>完全隐形</p>
<p><strong>缺点：</strong>价格最高，适应期长</p>
<p><strong>价格：</strong>40000-80000元</p>

<h2>矫正需要多长时间？</h2>
<p>一般1.5-2.5年，具体取决于牙齿情况的复杂程度。</p>

<p><em>矫正前请进行全面的口腔检查和方案设计。</em></p>`
  }
]

// ============ Q&A ============
export const qaList = [
  {
    id: 'q1',
    question: '双眼皮手术疼不疼？',
    answer: '双眼皮手术采用局部麻醉，手术过程中基本无痛感。术后麻醉消退后会有轻微胀痛感，口服止痛药即可缓解。一般术后2-3天疼痛感就会明显减轻。',
    category: 'double_eyelid',
    like_count: 156
  },
  {
    id: 'q2',
    question: '玻尿酸打多了会不会僵硬？',
    answer: '选择正规产品、由经验丰富的医生注射，一般不会出现僵硬问题。过量注射确实可能导致面部不自然，所以建议少量多次，循序渐进。',
    category: 'skin_care',
    like_count: 203
  },
  {
    id: 'q3',
    question: '隆鼻假体需要定期更换吗？',
    answer: '目前的硅胶和膨体假体理论上可以终身使用，不需要定期更换。但如果出现假体移位、透光、包膜挛缩等问题，可能需要取出或更换。建议术后定期复查。',
    category: 'nose',
    like_count: 178
  },
  {
    id: 'q4',
    question: '热玛吉做完脸会不会凹陷？',
    answer: '正规操作不会。热玛吉是刺激胶原蛋白再生，不会导致脂肪流失。但如果能量设置过高或操作不当，可能会有不适。选择正品设备和有经验的医生很重要。',
    category: 'anti_aging',
    like_count: 234
  },
  {
    id: 'q5',
    question: '瘦脸针打多了会不会面部下垂？',
    answer: '短期内不会。但长期频繁注射可能导致咬肌过度萎缩，看起来面部有些松弛。建议每年注射不超过2-3次，让肌肉有适当恢复的时间。',
    category: 'face',
    like_count: 312
  },
  {
    id: 'q6',
    question: '美白针真的有效吗？',
    answer: '所谓"美白针"主要成分是谷胱甘肽和维生素C，通过静脉注射。短期可能有一定提亮效果，但持续时间有限，且长期注射存在肝肾负担风险。国家药监局并未批准"美白针"类产品，建议谨慎选择。',
    category: 'skin_care',
    like_count: 445
  },
  {
    id: 'q7',
    question: '做完光子嫩肤可以化妆吗？',
    answer: '术后建议24-48小时内不要化妆，让皮肤充分恢复。之后可以使用温和的化妆品，但一周内避免使用含酒精、酸类的产品。防晒是术后最重要的护理步骤。',
    category: 'skin_care',
    like_count: 167
  },
  {
    id: 'q8',
    question: '牙齿矫正有年龄限制吗？',
    answer: '没有严格的年龄上限，成年人同样可以做牙齿矫正。青少年时期（12-18岁）是矫正的黄金期，但很多30-50岁的成年人也在进行矫正，只是矫正时间可能略长。',
    category: 'dental',
    like_count: 289
  }
]

// ============ Tips ============
export const tipsList = [
  {
    id: 't1',
    title: '术后冷敷小技巧',
    content: '术后48小时内冷敷可以有效减少肿胀。用保鲜袋装冰块，外裹薄毛巾，每次15分钟，间隔30分钟。注意不要让水碰到伤口。',
    icon: 'snowflake'
  },
  {
    id: 't2',
    title: '防晒是最好的抗衰',
    content: '80%的皮肤老化来自光老化。坚持每天涂抹SPF30+的防晒霜，每2小时补涂一次。即使阴天也不要偷懒，紫外线无处不在。',
    icon: 'sun'
  },
  {
    id: 't3',
    title: '如何判断医美机构是否正规？',
    content: '三看原则：一看《医疗机构执业许可证》，二看医生《执业医师资格证》和《医师执业证书》，三看使用的药品和器械是否有正规批号。',
    icon: 'shield'
  },
  {
    id: 't4',
    title: '术前停药清单',
    content: '手术前两周应停用：阿司匹林、维生素E、鱼油、银杏制剂等影响凝血的药物和保健品。具体请遵医嘱。',
    icon: 'pill'
  },
  {
    id: 't5',
    title: '熬夜是皮肤的大敌',
    content: '晚上10点到凌晨2点是皮肤修复的黄金期。长期熬夜会导致胶原蛋白流失加速、色素沉着、毛孔粗大等问题。再贵的护肤品也抵不过早睡的效果。',
    icon: 'moon'
  },
  {
    id: 't6',
    title: '保湿比你想象的更重要',
    content: '皮肤屏障健康的基础是充足的水分。选择含神经酰胺、透明质酸的保湿产品，早晚使用。皮肤水润了，很多问题自然会改善。',
    icon: 'droplet'
  }
]

// ============ Cases ============
export const caseList = [
  {
    id: 'c1',
    title: '全切双眼皮 · 3个月恢复记录',
    category: 'double_eyelid',
    description: '术前单眼皮、眼睛无神，术后眼睛变大有神，效果自然。',
    tags: ['全切', '自然型', '3个月']
  },
  {
    id: 'c2',
    title: '光子嫩肤 · 5次疗程对比',
    category: 'skin_care',
    description: '原本肤色暗沉、有色斑，经过5次光子嫩肤后皮肤明显提亮，色斑淡化。',
    tags: ['光子嫩肤', '祛斑', '5次疗程']
  },
  {
    id: 'c3',
    title: '隐形牙套矫正 · 18个月全记录',
    category: 'dental',
    description: '牙齿拥挤不齐，通过隐形矫正18个月，牙齿整齐排列，笑容更自信。',
    tags: ['隐适美', '牙齿矫正', '18个月']
  },
  {
    id: 'c4',
    title: '鼻综合手术 · 半年恢复效果',
    category: 'nose',
    description: '原本鼻头圆钝、鼻背低平，术后鼻型精致立体，侧面线条流畅。',
    tags: ['鼻综合', '半年', '自然']
  }
]

// ============ Hot Searches ============
export const hotSearches = [
  '双眼皮', '光子嫩肤', '玻尿酸', '隆鼻', '瘦脸针',
  '热玛吉', '牙齿矫正', '刷酸', '抗衰', '吸脂'
]

// ============ Helper functions ============

export function getArticleById(id) {
  return articleList.find(a => a._id === id) || null
}

export function getArticlesByCategory(category, page = 1, pageSize = 10) {
  let list = articleList
  if (category && category !== 'all') {
    list = list.filter(a => a.category === category)
  }
  const start = (page - 1) * pageSize
  return {
    data: list.slice(start, start + pageSize),
    hasMore: start + pageSize < list.length
  }
}

export function searchArticles(keyword) {
  if (!keyword) return []
  const kw = keyword.toLowerCase()
  return articleList.filter(a =>
    a.title.includes(kw) || a.summary.includes(kw) || a.category.includes(kw)
  )
}

export function getQAByCategory(category) {
  if (!category || category === 'all') return qaList
  return qaList.filter(q => q.category === category)
}

export function getRelatedArticles(currentId, category, limit = 3) {
  return articleList
    .filter(a => a._id !== currentId && a.category === category)
    .slice(0, limit)
}

// Format read count
export function formatCount(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return String(num)
}

// Format time ago
export function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < hour) return Math.floor(diff / minute) + '分钟前'
  if (diff < day) return Math.floor(diff / hour) + '小时前'
  if (diff < 30 * day) return Math.floor(diff / day) + '天前'
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
