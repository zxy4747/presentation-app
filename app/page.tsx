"use client";

import { useMemo, useState, useRef } from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";

/* =========================
   型定義
========================= */
type Rubric = {
    level5: string;
    level4: string;
    level3: string;
    level2: string;
    level1: string;
};

type Point = {
    label: string;
    rubric: Rubric;
    exampleGood: string;
    exampleBad: string;
    studyHint: string;
};

type EvaluationItem = {
    title: string;
    points: Point[];
};

type Scores = Record<string, number>;
type State = Record<string, Scores>;

/* =========================
   完全5段階 ルーブリックデータ
========================= */
const evaluationItems: EvaluationItem[] = [
    {
        title: "内容理解",
        points: [
            {
                label: "専門用語の説明",
                rubric: {
                    level5: "専門用語出現直後に確実な定義または分かりやすい言い換えがある",
                    level4: "専門用語の説明はあるが、やや表現が難解な部分が残る",
                    level3: "重要な用語のみ一部説明しているが、その他はそのまま流している",
                    level2: "用語の羅列に近く、説明が不十分で聞き手が置いていかれる",
                    level1: "専門用語に対する説明や補足が一切ない"
                },
                exampleGood: "SSRとはサーバ側で画面生成する技術と説明",
                exampleBad: "専門用語のみで説明なし",
                studyHint: "専門用語が出たら、すぐ「つまり、日常の言葉で言うと〜」と言い換える癖をつけましょう。",
            },
            {
                label: "具体例の提示",
                rubric: {
                    level5: "解説の直後に、誰もがイメージできる具体的な事例やデータがある",
                    level4: "具体例はあるが、少しマニアックで伝わりにくい部分がある",
                    level3: "一部のトピックにのみ具体例があり、全体的には抽象的",
                    level2: "例え話を出そうとしているが、主旨からズレていて分かりにくい",
                    level1: "抽象的な説明のみで、具体例が一つもない"
                },
                exampleGood: "実際のWeb画面を例に説明",
                exampleBad: "抽象説明のみ",
                studyHint: "「例えば〜」という接続詞を意識的に使い、聞き手の頭の中に絵（情景）が浮かぶエピソードを入れましょう。",
            },
            {
                label: "結論の明示",
                rubric: {
                    level5: "結論が最初に明示され、最後にも要点がきれいに整理されている",
                    level4: "結論は分かるが、そこに辿り着くまでの理由が少し弱い",
                    level3: "話の最後に結論らしきものはあるが、やや曖昧で印象に残りにくい",
                    level2: "最後まで話をきかないと、何を一番伝えたいのかが分からない",
                    level1: "テーマに対する明確な結論がない"
                },
                exampleGood: "最後に要点を整理",
                exampleBad: "結論がない",
                studyHint: "PREP法を意識し、発表の冒頭で「今日一番お伝えしたい結論は〇〇です」と言い切る訓練をしましょう。",
            },
            {
                label: "一貫性",
                rubric: {
                    level5: "導入から結論まで、話題のブレが一切なくスムーズに繋がっている",
                    level4: "基本は一貫しているが、一部本筋から逸れた余談がある",
                    level3: "全体の流れは繋がっているが、途中で少し論理の飛躍を感じる",
                    level2: "話の軸が途中で変わり、聞き手が混乱する瞬間がある",
                    level1: "論理のつながりが崩壊しており、何を話しているか分からない"
                },
                exampleGood: "導入から結論まで一貫",
                exampleBad: "途中で話題が変わる",
                studyHint: "話の脱線を防ぐため、事前にマインドマップや箇条書きで「話さないことリスト」を作っておきましょう。",
            },
        ],
    },
    {
        title: "構成",
        points: [
            { label: "目的提示", rubric: { level5: "冒頭の30秒以内に、この発表の目的とゴールが明確に提示されている", level4: "目的は伝わるが、聞き手にとってのメリットが少し分かりにくい", level3: "何についての話かは分かるが、最終的なゴールがやや曖昧", level2: "導入が長く、何のためにこの話を聞いているのか途中で迷子になる", level1: "目的やテーマの提示がなく、何の話か分からないまま始まる" }, exampleGood: "今回は○○について説明します", exampleBad: "何の話か不明", studyHint: "開始30秒以内に「この発表が終わった時、皆さんに〇〇な状態になってもらうのがゴールです」と宣言しましょう。" },
            { label: "話題転換", rubric: { level5: "適切な接続語やスライドの区切りにより、話の切り替わりが非常に明確", level4: "切り替わりは分かるが、前のトピックとの繋がりが少し強引", level3: "「次に〜」などの最低限の言葉はあるが、やや単調な展開", level2: "前触れなく急に話が変わるため、聞き手がついていくのに少し必死になる", level1: "突然全く別の話題にジャンプし、脈絡が一切ない" }, exampleGood: "次に〜と接続", exampleBad: "急に話が変わる", studyHint: "スライドをめくった瞬間、あえて1秒止まり「さて、ここからはテーマが変わります」と声のトーンを変えてみましょう。" },
            { label: "論理順序", rubric: { level5: "聞き手の疑問を先回りするような、完璧な因果関係の順に並んでいる", level4: "論理的ではあるが、時系列やステップの前後が一部惜しい", level3: "一般的な構成（背景→本論→まとめ）だが、並び順に工夫はない", level2: "思いついた順に話している印象があり、情報の整理が甘い", level1: "順序が無秩序で、バラバラの情報を聞かされている感覚になる" }, exampleGood: "順序が明確", exampleBad: "バラバラ", studyHint: "スライドの順番を「なぜ？」という疑問に対する「答え」が次にくるようなパズルとして並び替えてみましょう。" },
            { label: "まとめ", rubric: { level5: "最後に重要ポイントが3つ以内の箇条書きなどで、完璧に集約されている", level4: "まとめはあるが、要素が多くて少し記憶に残りづらい", level3: "軽い振り返りはあるが、箇条書きなどの視覚的な整理はない", level2: "「以上です」と急に終わり、内容の振り返りが不十分", level1: "まとめや振り返りの時間が一切なく、唐突に終了する" }, exampleGood: "要点整理あり", exampleBad: "まとめなし", studyHint: "「今日のおさらいです」というスライドを最後に1枚作り、15秒で全容を振り返る時間を設けてください。" },
        ],
    },
    {
        title: "話し方",
        points: [
            { label: "音量", rubric: { level5: "部屋の最後列まで無理なく届き、メリハリ（強弱）もついている", level4: "全体に聞こえる十分な大きさだが、終始一定の音量で平坦", level3: "基本は聞こえるが、語尾や自信のない部分で声が小さくなる", level2: "全体的に声が小さく、聞き手が耳をすまさないと聞き取れない", level1: "ボソボソ声で全く聞こえず、発表内容が伝わらない" }, exampleGood: "全体に聞こえる", exampleBad: "小さい声", studyHint: "「語尾」を小さく消さないよう、文末の「〜です」「〜ます」まではっきりと発声しきる意識を持ちましょう。" },
            { label: "速度", rubric: { level5: "聞き取りやすく、重要な場面であえてゆっくり話すなどの緩急がある", level4: "聞き取りやすい一定の速度だが、少し教科書を読んでいるような単調さがある", level3: "少し早口（または少し遅い）だが、内容の理解には支障がないレベル", level2: "緊張からかなりの早口になっており、情報が頭を通り過ぎてしまう", level1: "マシンガントークのように速すぎる、または遅すぎて退屈させる" }, exampleGood: "安定した速度", exampleBad: "速すぎる/遅すぎる", studyHint: "緊張しやすい人は、発表直前に深くため息を吐き、メトロノームのゆったりしたテンポを頭の中で刻みましょう。" },
            { label: "発音", rubric: { level5: "一文字一文字が明瞭で、言葉がハキハキと耳に飛び込んでくる", level4: "基本ははっきりしているが、たまに言葉が詰まる部分がある", level3: "日常会話レベルの聞き取りやすさはあるが、少しフガフガした印象", level2: "滑舌がやや甘く、言葉の輪郭がぼやけて聞き取りにくい", level1: "終始モゴモゴしており、何を言っているのか聞き取れない" }, exampleGood: "はっきり発音", exampleBad: "聞き取りづらい", studyHint: "特に「あ・い・う・え・お」の母音を意識して、口の形を縦横にしっかり動かして発音する練習が効果的です。" },
            { label: "間", rubric: { level5: "意味の区切りや、重要なキーワードの前後で「あえて 2秒黙る」ができている", level4: "適切な間はあるが、無意識に「えーっと」「あの」が少し混ざる", level3: "文章の句読点での間はあるが、強調のための戦略的な間はない", level2: "間がほとんどなく、息継ぎのタイミングだけで次の文章に進んでしまう", level1: "沈黙を恐れるあまり、言葉を隙間なく詰め込み続けている" }, exampleGood: "重要箇所で間", exampleBad: "間がない", studyHint: "「えー」「あのー」が出そうになったら、口を閉じて「無音（沈黙）の1秒」を作るように置き換えていきましょう。" },
        ],
    },
    {
        title: "非言語",
        points: [
            { label: "視線", rubric: { level5: "会場全体（左・中・右）を均等に見渡し、一人ひとりと目を合わせている", level4: "聴衆の方を向いているが、特定の一点や特定の人のみを見ている", level3: "基本は聴衆を見ているが、チラチラと手元の資料や画面を見る頻度が多い", level2: "ほぼスライド画面か手元の原稿を見ており、たまにしか聴衆を見ない", level1: "終始うつむいているか、原稿を完全に棒読みして目を合わせない" }, exampleGood: "全体を見る", exampleBad: "下ばかり", studyHint: "「1つの文章（。まで）を話す間は、特定の1人の目を見続ける」というワンセンテンス・ワンパーソン法が有効です。" },
            { label: "姿勢", rubric: { level5: "背筋が伸び、重心が安定しており、堂々とした風格がある", level4: "姿勢は良いが、少し肩に力が入りすぎていて硬い印象をあたえる", level3: "普通の立ち姿だが、無意識に少し体が左右に揺れることがある", level2: "片足重心（休め姿勢）になったり、ふらふらと落ち着きなく動いてしまう", level1: "猫背で極端に自信がなさそうに見える、または寄りかかっている" }, exampleGood: "安定した姿勢", exampleBad: "ふらつく", studyHint: "足の裏全体で大地の砂を掴むようなイメージで立ち、へその下（丹田）に力を入れて重心を固定させましょう。" },
            { label: "表情", rubric: { level5: "状況に応じて笑顔や真剣な表情を使い分け、親しみやすさと説得力がある", level4: "穏やかな表情だが、少し緊張で引きつっている時間がある", level3: "良くも悪くも普通の表情（真顔）で、感情の起伏が伝わりにくい", level2: "終始硬い表情で、聞き手に威圧感や緊張感を与えてしまっている", level1: "無表情、または不安そうな顔が前面に出てしまっている" }, exampleGood: "自然な表情", exampleBad: "無表情", studyHint: "鏡の前で、眉を少し上げて目を開き、明るい印象を作る「ファシリテーター・スマイル」の練習をしてみましょう。" },
            { label: "ジェスチャー", rubric: { level5: "数字の提示や大きさの表現と、手の動きが完璧に連動して効果的", level4: "手は動いているが、同じ動きの繰り返しで少し不自然", level3: "たまに手が少し動く程度で、基本は体の横に固定されている", level2: "手持ち無沙汰で、服を触ったりペンをカチカチさせたりしてしまう", level1: "ポケットに手を入れている、または完全に直立不動のまま" }, exampleGood: "説明と連動", exampleBad: "動きなし", studyHint: "手が下に下がっていると動きにくいので、基本姿勢として「胸とおへその間の高さで手を軽く組む」形を作りましょう。" },
        ],
    },
    {
        title: "資料",
        points: [
            { label: "文字サイズ", rubric: { level5: "一番後ろの席からでも、すべての文字がストレスなく瞬時に読める", level4: "全体的に見やすいが、一部の補足テキストが少し小さくて見づらい", level3: "一般的なサイズ（24pt前後）だが、文字数が多くて読むのに少しパワーがいる", level2: "文字が小さく、スライドにかなり近づかないと読めない部分が多い", level1: "画面いっぱいに小さな文字が詰め込まれており、読む気をなくさせる" }, exampleGood: "後方からも見える", exampleBad: "小さすぎる", studyHint: "ノートPCで資料を作る際、画面を2メートル離れた場所から眺めても読めるかどうかをセルフチェックしましょう。" },
            { label: "情報量", rubric: { level5: "「1スライド＝1メッセージ」が徹底され、一瞬で主旨が理解できる", level4: "整理されているが、1枚に2つのテーマが少し混ざっている", level3: "一般的な箇条書きだが、文章が長いため情報がやや多く感じる", level2: "原稿の内容がそのままスライドにコピペされたようで、文字だらけ", level1: "情報が過剰で、どこを見ればいいのかパニックになる" }, exampleGood: "1スライド1テーマ", exampleBad: "情報過多", studyHint: "1枚のスライドに含まれる文字数は「多くても40文字以内」を目標に、徹底的に贅肉を削ぎ落としてください。" },
            { label: "視認性", rubric: { level5: "使う色が3色以内に絞られており、強調したい部分が際立っている", level4: "綺麗だが、少し色のコントラストが弱く、見づらい箇所がある", level3: "目立つ色（赤や黄色）を使っているが、少し配置に統一感がない", level2: "カラフルすぎて、どこが本当に重要なポイントなのか分からない", level1: "背景と同系色の文字で見えない、または原色だらけで目が疲れる" }, exampleGood: "コントラスト良好", exampleBad: "見えない", studyHint: "背景は白か薄いグレー、文字は濃いグレー（#333）、アクセントは「青」か「オレンジ」の1色のみにするのが一番安全です。" },
            { label: "図表", rubric: { level5: "図解、グラフ、イラストが効果的に配置され、文字を読まなくても意味がわかる", level4: "図やグラフはあるが、データの出所や軸のラベルが少し不親切", level3: "ただ四角い枠で囲っただけなど、最低限のレイアウト装飾のみ", level2: "図を入れようとしているが、画質が荒かったり意図が不明瞭", level1: "テキスト（文字）のみの構成で、図解や視覚的工夫が一切ない" }, exampleGood: "図で理解促進", exampleBad: "文章のみ", studyHint: "「並列」「対比」「時系列」など、話の構造に合ったSmartArtや図形テンプレートを枠組みとして使いましょう。" },
        ],
    },
    {
        title: "質疑応答",
        points: [
            { label: "質問理解", rubric: { level5: "質問の意図を完璧に見抜き、「ご質問は〇〇ですね」と綺麗に確認できている", level4: "質問の内容は理解できているが、確認のワンクッションがないため少し強引に答える", level3: "表面的な言葉通りに回答しているが、質問者の隠れた意図までは汲み取れていない", level2: "的を外した回答をしてしまい、質問者から聞き直される場面がある", level1: "質問の意図を完全に誤解し、全く関係のない自説を語り出す" }, exampleGood: "質問を言い換えて確認", exampleBad: "誤解して回答", studyHint: "質問を聞きながら「この人は何を解決したいのか（背景にある困りごとは何か）」をメモする癖をつけましょう。" },
            { label: "回答構造", rubric: { level5: "「結論から申し上げますと〜」と始め、理由と根拠を美しく述べている", level4: "結論ファーストではあるが、その後の説明が少し長くなってしまった", level3: "結論は伝わるが、言い訳や前置きが少し長くてまどろっこしい", level2: "話し始めに前置きが長く、最終的なYES/NOの結論がなかなか見えない", level1: "ダラダラととりとめもなく話し続け、結局何が言いたかったのか不明" }, exampleGood: "結論から回答", exampleBad: "長くて不明瞭", studyHint: "「一言で答えると、可能です。理由は〜」のように、最初の1文を5秒以内に終わらせる意識を持ちましょう。" },
            { label: "適合性", rubric: { level5: "質問された問いに対して、過不足なくピンポイントに正確に回答している", level4: "回答としては合っているが、少し余計な情報まで喋りすぎている", level3: "大体は答えているが、少し論点がズレて回答が濁っている部分がある", level2: "分からない質問に対して、話をすり替えたり誤魔化したりしてしまっている", level1: "質問への回答を拒絶する、または質問を完全に無視して話を終わらせる" }, exampleGood: "質問に正確回答", exampleBad: "論点ずれ", studyHint: "聞かれていない周辺知識をアピールしようとせず、「聞かれた問いの枠」からはみ出さない回答を心がけましょう。" },
            { label: "安定性", rubric: { level5: "予想外の鋭い指摘に対しても、笑顔で受け止めて冷静かつスマートに対応している", level4: "落ち着いて答えているが、少し声のトーンが下がり焦りが見える", level3: "最低限の受け答えはできるが、動揺が表情や仕草に出てしまっている", level2: "タジタジになり、言葉に詰まって不自然な沈黙が生まれてしまう", level1: "逆上して反論する、または完全にフリーズしてパニックになる" }, exampleGood: "落ち着いて回答", exampleBad: "焦っている", studyHint: "厳しい突っ込みは「発表に興味を持ってくれた証拠」と捉え、「鋭いご視点、大変勉強になります」と笑顔で返しましょう。" },
        ],
    },
];

const createInitialState = (): State => {
    const obj: State = {};
    evaluationItems.forEach((item) => {
        obj[item.title] = {};
        item.points.forEach((p) => {
            obj[item.title][p.label] = 3;
        });
    });
    return obj;
};

export default function AdvancedReportSystem() {
    const [selfScores, setSelfScores] = useState<State>(() => createInitialState());
    const [notes, setNotes] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isBrowser = typeof window !== "undefined";

    const handleScoreSelect = (section: string, point: string, value: number) => {
        setSelfScores((prev) => ({
            ...prev,
            [section]: { ...(prev[section] ?? {}), [point]: value },
        }));
    };

    const chartData = useMemo(() => {
        return evaluationItems.map((item) => {
            const selfVals = Object.values(selfScores[item.title] ?? {});
            const selfAvg = selfVals.length ? selfVals.reduce((a, b) => a + b, 0) / selfVals.length : 0;
            return {
                subject: item.title,
                self: parseFloat(selfAvg.toFixed(1)),
            };
        });
    }, [selfScores]);

    const analysisReport = useMemo(() => {
        const items = chartData.map((d) => ({ title: d.subject, self: d.self }));
        const totalSelfScore = (items.reduce((acc, curr) => acc + curr.self, 0) / items.length) * 20;

        const specificWeaknesses: string[] = [];
        evaluationItems.forEach((item) => {
            item.points.forEach((p) => {
                const score = selfScores[item.title]?.[p.label] ?? 3;
                if (score <= 2) {
                    specificWeaknesses.push(`【${item.title} ＞ ${p.label}】${p.studyHint}`);
                }
            });
        });

        const actionPlans = [...specificWeaknesses];
        if (actionPlans.length === 0) {
            const lowCategories = [...items].filter((item) => item.self < 3.5).sort((a, b) => a.self - b.self);
            lowCategories.slice(0, 3).forEach((w) => {
                const targetCategory = evaluationItems.find((i) => i.title === w.title);
                if (targetCategory && targetCategory.points.length > 0) {
                    actionPlans.push(`【${w.title}全体の底上げ】${targetCategory.points[0].studyHint}`);
                }
            });
        }

        if (actionPlans.length === 0) {
            actionPlans.push("🎉 苦手な項目がありません！素晴らしいクオリティを維持しましょう。");
        }

        return { totalSelfScore, actionPlans: actionPlans.slice(0, 4) };
    }, [chartData, selfScores]);

    const exportData = () => {
        const dataStr = JSON.stringify({ selfScores, notes }, null, 2);
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const exportFileDefaultName = `presentation_self_analysis_${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
    };

    const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (e.target.files && e.target.files[0]) {
            fileReader.readAsText(e.target.files[0], "UTF-8");
            fileReader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target?.result as string);
                    if (parsed.selfScores) setSelfScores(parsed.selfScores);
                    if (parsed.notes !== undefined) setNotes(parsed.notes);
                    alert("評価データおよび振り返りメモを正常に読み込みました。");
                } catch {
                    alert("ファイルの読み込みに失敗しました。");
                }
            };
        }
    };

    if (!isBrowser) {
        return <div className="p-8 text-slate-400 bg-slate-900 min-h-screen">読み込み中...</div>;
    }

    return (
        <main className="p-4 md:p-8 bg-slate-950 min-h-screen text-slate-100 antialiased selection:bg-teal-500/30">
            <div className="max-w-2xl mx-auto space-y-10">

                {/* 固定ヘッダー */}
                <div className="bg-gradient-to-br from-teal-500 via-cyan-600 to-indigo-600 p-6 rounded-3xl shadow-2xl border border-white/10 text-center sm:text-left">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">プレゼン自己評価システム</h1>
                    <p className="text-teal-500 bg-slate-950/40 font-bold px-3 py-1 rounded-full inline-block text-[11px] mt-2 border border-white/5">
                        5段階基準ルーブリック × 弱点自動分析カルテ
                    </p>
                </div>

                {/* 📋 縦並び入力フィールド */}
                <div className="space-y-12">
                    <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl text-xs text-slate-400 text-center shadow-inner leading-relaxed">
                        💡 1点〜5点の基準を読み比べ、自分の発表に最も当てはまる項目をタップしてください。
                    </div>

                    {evaluationItems.map((item, itemIdx) => (
                        <div key={item.title} className="space-y-6 relative">

                            {/* 区分線と大きなカテゴリ見出し */}
                            {itemIdx > 0 && <div className="border-t-2 border-slate-800/80 my-8" />}
                            <div className="sticky top-0 z-10 py-2 bg-slate-950/90 backdrop-blur-md flex items-center justify-between">
                                <span className="text-xs font-black tracking-widest text-slate-400 uppercase bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-800 shadow-sm">
                                    CATEGORY {itemIdx + 1}
                                </span>
                                <h2 className="text-lg font-black text-teal-400 tracking-wider pr-2">{item.title}</h2>
                            </div>

                            {/* 各項目カード */}
                            {item.points.map((p) => {
                                const currentScore = selfScores[item.title]?.[p.label] ?? 3;
                                return (
                                    <div key={p.label} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-5 transition-all hover:border-slate-700/60">

                                        {/* カード内タイトル */}
                                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                            <h3 className="text-base font-black text-slate-200 tracking-tight">{p.label}</h3>
                                            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                                {currentScore}点 を選択中
                                            </span>
                                        </div>

                                        {/* 完全5段階 選択肢（ポチポチ動く触覚フィードバックを追加） */}
                                        <div className="space-y-2.5">
                                            {[
                                                { score: 5, text: p.rubric.level5 },
                                                { score: 4, text: p.rubric.level4 },
                                                { score: 3, text: p.rubric.level3 },
                                                { score: 2, text: p.rubric.level2 },
                                                { score: 1, text: p.rubric.level1 },
                                            ].map((row) => {
                                                const isSelected = currentScore === row.score;
                                                return (
                                                    <button
                                                        key={row.score}
                                                        type="button"
                                                        onClick={() => handleScoreSelect(item.title, p.label, row.score)}
                                                        className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3.5 relative overflow-hidden transform active:scale-[0.99] ${isSelected
                                                                ? "bg-teal-950/40 border-teal-500 text-teal-100 font-bold shadow-lg ring-1 ring-teal-500/20 border-l-[6px]"
                                                                : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                                            }`}
                                                    >
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black mt-0.5 shadow-md shrink-0 tracking-tighter ${isSelected ? "bg-teal-400 text-slate-950" : "bg-slate-800/80 text-slate-500"
                                                            }`}>
                                                            {row.score} 点
                                                        </span>
                                                        <p className="text-xs leading-relaxed font-medium tracking-wide">{row.text}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* クイック目安カンペ */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-[11px] leading-relaxed">
                                            <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20 text-slate-300">
                                                <span className="text-emerald-400 font-extrabold flex items-center gap-1 mb-1 text-xs">
                                                    <span>👍</span> 良い状態の目安
                                                </span>
                                                {p.exampleGood}
                                            </div>
                                            <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-500/20 text-slate-300">
                                                <span className="text-rose-400 font-extrabold flex items-center gap-1 mb-1 text-xs">
                                                    <span>⚠️</span> 悪い状態の目安
                                                </span>
                                                {p.exampleBad}
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* 📝 自由メモ帳コーナー */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
                    <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                        <span className="text-teal-400">✍️</span> 発表全体のふり返りメモ・もらったコメント
                    </h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="「質疑応答で焦ってしまった」「スライド3枚目の配色を褒められた」など、気づいたことや貰った指摘を自由に入力してください。"
                        className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none leading-relaxed"
                    />
                </div>

                {/* 📊 振り返り分析カルテ（スマホはみ出し対策・初期アニメーションを追加） */}
                <div className="border-t-2 border-dashed border-slate-800 pt-8">
                    <div className="bg-slate-900 border border-slate-800 p-5 md:p-6 rounded-2xl shadow-xl space-y-6">
                        <div className="text-center space-y-1">
                            <h2 className="text-lg font-black tracking-wider text-slate-200">📊 振り返り分析カルテ</h2>
                            <p className="text-[11px] text-slate-400">入力されたすべてのスコアの平均バランス図</p>
                        </div>

                        {/* チャートコンテナ */}
                        <div className="flex justify-center bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner overflow-hidden">
                            <ResponsiveContainer width="100%" height={260}>
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }} />
                                    <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fill: '#64748b', fontSize: 9 }} />
                                    <Radar
                                        name="自己評価"
                                        dataKey="self"
                                        stroke="#2dd4bf"
                                        fill="#2dd4bf"
                                        fillOpacity={0.15}
                                        strokeWidth={2.5}
                                        isAnimationActive={true}
                                        animationDuration={600}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* 点数パネル */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center shadow-inner">
                            <div className="text-slate-400 text-xs font-bold tracking-wide">総合評価スコア（100点換算）</div>
                            <div className="text-2xl font-black text-teal-400 mt-1 tracking-tight">{analysisReport.totalSelfScore.toFixed(1)} <span className="text-xs text-slate-500 font-medium">/ 100点</span></div>
                        </div>

                        {/* 弱点対策プラン */}
                        <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800 shadow-inner">
                            <h4 className="text-xs font-black text-teal-400 mb-3 flex items-center gap-1.5 tracking-wider uppercase">
                                <span>🎯</span> あなたのためのピンポイント弱点対策プラン
                            </h4>
                            <div className="space-y-2">
                                {analysisReport.actionPlans.map((plan, index) => (
                                    <div key={index} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 shadow-sm transition-all hover:bg-slate-950">
                                        <input type="checkbox" className="mt-0.5 rounded accent-teal-400 border-slate-700 bg-slate-900 text-teal-500 scale-105" />
                                        <span className="font-medium">{plan}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* 💾 データ管理エリア（最下部・押しやすい2ボタン） */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                    <div className="text-center sm:text-left">
                        <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">💾 評価データの保存と読み込み</h3>
                        <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
                            採点したスコアとメモ帳の内容を1つのJSONファイルとして端末ローカルに保存・復元できます。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <button
                            onClick={exportData}
                            className="w-full py-3.5 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-1.5"
                        >
                            <span>📥</span> ファイルに保存する
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-xl border border-slate-700 shadow-md transition-all transform active:scale-[0.98] flex items-center justify-center gap-1.5"
                        >
                            <span>📤</span> 過去のデータを読み込む
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
                </div>

            </div>
        </main>
    );
}