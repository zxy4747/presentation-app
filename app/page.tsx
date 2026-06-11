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
type Point = {
    label: string;
    criterion: string; // 評価基準（この一文に対して1〜5で採点する）
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
   レベル文章を排除した評価データ（全20項目）
========================= */
const evaluationItems: EvaluationItem[] = [
    {
        title: "内容理解",
        points: [
            {
                label: "専門用語の説明",
                criterion: "専門用語出現直後に、確実な定義や分かりやすい言い換えができているか",
                exampleGood: "「SSRとはサーバ側で画面生成する技術」と言い換えて説明",
                exampleBad: "専門用語をそのまま並べて解説なしに進める",
                studyHint: "専門用語が出たら、直後に日常の言葉で補足する癖をつけましょう。"
            },
            {
                label: "具体例の提示",
                criterion: "解説の直後に、誰もがイメージできる具体的な事例やデータを出せているか",
                exampleGood: "「例えば、実際のWeb画面では〜」と身近な例を出す",
                exampleBad: "抽象的な理論や概念の説明だけで終わる",
                studyHint: "「例えば〜」という接続詞を意識的に使い、聞き手の頭に絵を浮かべましょう。"
            },
            {
                label: "結論の明示",
                criterion: "結論が最初に明示され、最後にも要点がきれいに整理されているか",
                exampleGood: "冒頭で「結論は〇〇です」と言いきり、最後におさらいをする",
                exampleBad: "最後まで話をしっかりと聞かないと、一番伝えたいことが分からない",
                studyHint: "PREP法を意識し、発表の開始直後にゴールを提示する訓練をしましょう。"
            },
            {
                label: "一貫性",
                criterion: "導入から結論まで、話題のブレや論理の飛躍がなくスムーズに繋がっているか",
                exampleGood: "本筋のテーマから外れずに、ロジックが一本の線で繋がっている",
                exampleBad: "途中で本論とは関係のない余談や、急な話題転換が入る",
                studyHint: "話の脱線を防ぐため、事前に「話さないことリスト」を作っておきましょう。"
            }
        ]
    },
    {
        title: "構成",
        points: [
            { label: "目的提示", criterion: "冒頭の30秒以内に、この発表の目的とゴールを明確に提示できているか", exampleGood: "「今回は○○をゴールとして説明します」と宣言", exampleBad: "何のためにこの話を聞いているのか分からないまま進む", studyHint: "開始30秒以内に、聞き手が受け取れるメリットを簡潔に伝えましょう。" },
            { label: "話題転換", criterion: "適切な接続語やスライドの区切りにより、話の切り替わりが明確か", exampleGood: "「さて、ここからはテーマが変わります」と言葉と声を変える", exampleBad: "前触れなく急に話が変わるため、聞き手がついていけない", studyHint: "スライドをめくった瞬間にあえて1秒止まり、接続詞を意識的に挟みましょう。" },
            { label: "論理順序", criterion: "聞き手の疑問を先回りするような、綺麗な因果関係の順に並んでいるか", exampleGood: "「なぜ？」という疑問に対する答えが、次のスライドにくる構成", exampleBad: "思いついた順に話している印象があり、順序が無秩序", studyHint: "スライドの順番を、疑問と回答のパズルとして並び替えてみましょう。" },
            { label: "まとめ", criterion: "最後に重要ポイントが3つ以内の箇条書きなどで、綺麗に集約されているか", exampleGood: "「今日のおさらいです」と15秒で全容を振り返る", exampleBad: "「以上です」と急に終わり、内容の振り返りがない", studyHint: "最後に振り返りスライドを1枚作り、記憶に残す時間を設けましょう。" }
        ]
    },
    {
        title: "話し方",
        points: [
            { label: "音量", criterion: "部屋の最後列まで無理なく届き、メリハリ（強弱）もつけられているか", exampleGood: "文末の「〜です」「〜ます」まではっきりと発声しきる", exampleBad: "全体的に声が小さく、自信のない部分で声が消えかける", studyHint: "「語尾」を小さく落とさないよう、最後まで息を吐ききって発声しましょう。" },
            { label: "速度", criterion: "聞き取りやすく、重要な場面であえてゆっくり話すなどの緩急があるか", exampleGood: "緊張せず落ち着いたテンポで、強調したい場所を落とす", exampleBad: "緊張からかなりの早口（または遅すぎ）になっている", studyHint: "発表直前に深くため息を吐き、ゆったりしたテンポを意識しましょう。" },
            { label: "発音", criterion: "一文字一文字が明瞭で、言葉がハキハキと聞き取りやすいか", exampleGood: "滑舌がよく、言葉の輪郭がはっきりと耳に飛び込んでくる", exampleBad: "終始モゴモゴしており、何を言っているのか聞き取れない", studyHint: "「あ・い・う・え・お」の母音を意識して、口を大きく動かしましょう。" },
            { label: "間", criterion: "意味の区切りや、重要なキーワードの前後で「あえて2秒黙る」ができているか", exampleGood: "沈黙を恐れず、重要な単語の前に適切なタメを作る", exampleBad: "無意識に「えーっと」「あの」などの充填語を連発する", studyHint: "「えー」が出そうになったら、口を閉じて「無音の1秒」に置き換えます。" }
        ]
    },
    {
        title: "非言語",
        points: [
            { label: "視線", criterion: "会場全体（左・中・右）を均等に見渡し、聴衆と目を合わせられているか", exampleGood: "1つの文章（。まで）を話す間、特定の1人を見続ける", exampleBad: "終始うつむいているか、スライド画面・原稿ばかり見る", studyHint: "「ワンセンテンス・ワンパーソン法」を意識して視線を配りましょう。" },
            { label: "姿勢", criterion: "背筋が伸び、重心が安定しており、堂々とした立ち姿であるか", exampleGood: "足の裏全体で床を掴むように立ち、重心が固定されている", exampleBad: "片足重心になったり、ふらふらと落ち着きなく動いてしまう", studyHint: "へその下（丹田）に少し力を入れて立つと、身体のブレが止まります。" },
            { label: "表情", criterion: "状況に応じて笑顔や真剣な顔を使い分け、感情が伝わっているか", exampleGood: "明るい印象を作る笑顔ができている", exampleBad: "終始硬い無表情、または不安そうな顔が出ている", studyHint: "鏡の前で、いつもより少しだけ眉を上げて話す練習をしてみましょう。" },
            { label: "ジェスチャー", criterion: "数字の提示や大きさの表現と、手の動きが自然に連動しているか", exampleGood: "話の強調に合わせて、胸の高さで手が効果的に動く", exampleBad: "ポケットに手を入れている、または完全に直立不動のまま", studyHint: "基本姿勢として「胸とおへその間で手を軽く組む」と動きやすくなります。" }
        ]
    },
    {
        title: "資料",
        points: [
            { label: "文字サイズ", criterion: "一番後ろの席からでも、すべての文字がストレスなく瞬時に読めるか", exampleGood: "見やすいフォントサイズ（24pt以上）を維持している", exampleBad: "文字が小さく、スライドに近づかないと読めない", studyHint: "PC画面から2メートル離れた場所から眺めて、読めるかセルフチェックします。" },
            { label: "情報量", criterion: "「1スライド＝1メッセージ」が徹底され、一瞬で主旨が分かるか", exampleGood: "1枚に含まれる文字数は多くても40文字以内に削る", exampleBad: "原稿の内容がそのままコピペされたようで文字だらけ", studyHint: "箇条書きを短くし、徹底的にテキストの贅肉を削ぎ落としてください。" },
            { label: "視認性", criterion: "使う色が3色以内に絞られており、強調したい部分が際立っているか", exampleGood: "白背景、濃いグレーの文字、アクセント1色で統一されている", exampleBad: "カラフルすぎて、どこが重要ポイントなのか分からない", studyHint: "ベース・メイン・アクセントの役割を決め、原色は避けましょう。" },
            { label: "図表", criterion: "図解、グラフ、イラストが効果的で、文字を読まなくても意味がわかるか", exampleGood: "話の構造（対比や時系列）に合った図形テンプレートがある", exampleBad: "テキスト（文字）のみの構成で、視覚的工夫が一切ない", studyHint: "ただ四角で囲むだけでなく、矢印などの関係性を図示しましょう。" }
        ]
    },
    {
        title: "質疑応答",
        points: [
            { label: "質問理解", criterion: "質問の意図を完璧に見抜き、「ご質問は〇〇ですね」と綺麗に確認できているか", exampleGood: "「〜〜という認識で合っていますか？」とすり合わせる", exampleBad: "的を外した回答をしてしまい、質問者から聞き直される", studyHint: "質問を聞きながら「この人は何を解決したいのか」をメモしましょう。" },
            { label: "回答構造", criterion: "「結論から申し上げますと〜」と始め、理由と根拠を美しく述べているか", exampleGood: "最初の1文を5秒以内に終わらせ、結論をファーストで話す", exampleBad: "言い訳や前置きが長く、YES/NOの結論がなかなか見えない", studyHint: "「一言で答えると〇〇です。理由は〜」の型を徹底しましょう。" },
            { label: "適合性", criterion: "質問された問いに対して、過不足なくピンポイントに正確に回答しているか", exampleGood: "「聞かれた問いの枠」からはみ出さずにストレートに答える", exampleBad: "分からない質問に対して、話をすり替えたり誤魔化したりする", studyHint: "周辺の知識をアピールしようとせず、問いに対する答えだけを返します。" },
            { label: "安定性", criterion: "予想外の鋭い指摘に対しても、受け止めて冷静に対応しているか", exampleGood: "「鋭いご視点、大変勉強になります」と冷静に返す", exampleBad: "タジタジになって言葉に詰まったり、反論してムキになる", studyHint: "厳しい突っ込みは「興味を持ってくれた証拠」と捉えましょう。" }
        ]
    }
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
                    alert("評価データを正常に読み込みました。");
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
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">報告力向上アプリ</h1>
                </div>

                {/* 📋 ガイド */}
                <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl text-xs text-slate-400 text-center shadow-inner leading-relaxed">
                    💡 各評価基準に対して、自身の達成度を5段階で直感的に選択してください。
                </div>

                {/* 入力フィールド */}
                <div className="space-y-12">
                    {evaluationItems.map((item, itemIdx) => (
                        <div key={item.title} className="space-y-6 relative">

                            {/* 区分線とカテゴリ見出し */}
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
                                    <div key={p.label} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4 transition-all hover:border-slate-700/60">

                                        {/* 評価項目名と基準文 */}
                                        <div className="border-b border-slate-800/60 pb-3 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-base font-black text-slate-200 tracking-tight">{p.label}</h3>
                                                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                                    {currentScore}点
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium">{p.criterion}</p>
                                        </div>

                                        {/* 🌟 1〜5すべてに「〜できている」の段階を表示する選択UI */}
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {[1, 2, 3, 4, 5].map((score) => {
                                                const isSelected = currentScore === score;

                                                const scoreLabels: Record<number, string> = {
                                                    1: "できていない",
                                                    2: "少しできている",
                                                    3: "概ねできている",
                                                    4: "十分できている",
                                                    5: "完璧にできている"
                                                };

                                                return (
                                                    <button
                                                        key={score}
                                                        type="button"
                                                        onClick={() => handleScoreSelect(item.title, p.label, score)}
                                                        className={`py-2.5 rounded-xl border-2 text-xs font-black transition-all transform active:scale-95 flex flex-col items-center justify-center gap-0.5 ${isSelected
                                                            ? "bg-teal-500 border-teal-400 text-slate-950 shadow-lg shadow-teal-500/10"
                                                            : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                                            }`}
                                                    >
                                                        <span className="text-sm">{score}</span>
                                                        <span className={`text-[8px] font-bold tracking-tighter leading-none opacity-90 ${isSelected ? "text-slate-950" : "text-slate-500"}`}>
                                                            {scoreLabels[score]}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* 良い例・悪い例のカンペ */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed pt-1">
                                            <div className="bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/10 text-slate-400">
                                                <span className="text-emerald-400 font-extrabold mr-1">○ 良い例:</span>{p.exampleGood}
                                            </div>
                                            <div className="bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/10 text-slate-400">
                                                <span className="text-rose-400 font-extrabold mr-1">× 悪い例:</span>{p.exampleBad}
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* 自由メモ帳 */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
                    <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                        <span className="text-teal-400">✍️</span> 発表全体のふり返りメモ・もらったコメント
                    </h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="気づいたことや、貰った指摘を自由に入力してください。"
                        className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none leading-relaxed"
                    />
                </div>

                {/* 📊 レーダーチャート＆カルテ */}
                <div className="border-t-2 border-dashed border-slate-800 pt-8">
                    <div className="bg-slate-900 border border-slate-800 p-5 md:p-6 rounded-2xl shadow-xl space-y-6">
                        <div className="text-center space-y-1">
                            <h2 className="text-lg font-black tracking-wider text-slate-200">📊 振り返り分析カルテ</h2>
                            <p className="text-[11px] text-slate-400">各カテゴリの平均スコア</p>
                        </div>

                        {/* チャート */}
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

                        {/* 総合点数 */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center shadow-inner">
                            <div className="text-slate-400 text-xs font-bold tracking-wide">総合評価スコア</div>
                            <div className="text-2xl font-black text-teal-400 mt-1 tracking-tight">{analysisReport.totalSelfScore.toFixed(1)} <span className="text-xs text-slate-500 font-medium">/ 100点</span></div>
                        </div>

                        {/* 対策プラン */}
                        <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800 shadow-inner">
                            <h4 className="text-xs font-black text-teal-400 mb-3 flex items-center gap-1.5 tracking-wider uppercase">
                                <span>🎯</span> あなたのための弱点対策プラン
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

                {/* 保存・読込ボタン */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <button
                            onClick={exportData}
                            className="w-full py-3.5 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-1.5"
                        >
                            <span>📥</span> ファイルに保存
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-xl border border-slate-700 shadow-md transition-all transform active:scale-[0.98] flex items-center justify-center gap-1.5"
                        >
                            <span>📤</span> データを読み込む
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
                </div>

            </div>
        </main>
    );
}