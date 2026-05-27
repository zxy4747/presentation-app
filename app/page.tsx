"use client";

import { useMemo, useState, useRef } from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
} from "recharts";

/* =========================
   型定義
========================= */

type Rubric = {
    level5: string;
    level3: string;
    level1: string;
};

type Point = {
    label: string;
    rubric: Rubric;
    exampleGood: string;
    exampleBad: string;
    studyHint: string; // 💡 学習要素：改善のためのヒント
};

type EvaluationItem = {
    title: string;
    points: Point[];
};

type Scores = Record<string, number>;
type State = Record<string, Scores>;

type Evaluator = {
    id: string;
    name: string;
    scores: State;
};

/* =========================
   ルーブリック ＆ 学習ヒントデータ
========================= */

const evaluationItems: EvaluationItem[] = [
    {
        title: "内容理解",
        points: [
            {
                label: "専門用語の説明",
                rubric: { level5: "専門用語出現直後に定義または言い換え", level3: "一部のみ説明", level1: "説明なし" },
                exampleGood: "SSRとはサーバ側で画面生成する技術と説明",
                exampleBad: "専門用語のみで説明なし",
                studyHint: "中学生でもイメージできる身近な言葉や例え話に置き換える練習をしましょう。",
            },
            {
                label: "具体例の提示",
                rubric: { level5: "直後に具体例あり", level3: "一部のみ", level1: "なし" },
                exampleGood: "実際のWeb画面を例に説明",
                exampleBad: "抽象説明のみ",
                studyHint: "「例えば〜」という接続詞を意識的に使い、聞き手が情景を想像できるエピソードを1つ入れましょう。",
            },
            {
                label: "結論の明示",
                rubric: { level5: "結論が明確", level3: "やや曖昧", level1: "なし" },
                exampleGood: "最後に要点を整理",
                exampleBad: "結論がない",
                studyHint: "PREP法（結論⇒理由⇒具体例⇒結論）を意識し、最初に「結論から言うと」と言い切る訓練をしましょう。",
            },
            {
                label: "一貫性",
                rubric: { level5: "流れが一貫", level3: "一部ずれ", level1: "崩壊" },
                exampleGood: "導入から結論まで一貫",
                exampleBad: "途中で話題が変わる",
                studyHint: "全体の構成案を事前に箇条書きで作り、目的に関係のないトピックを思い切って削る練習が効果的です。",
            },
        ],
    },
    {
        title: "構成",
        points: [
            { label: "目的提示", rubric: { level5: "冒頭で提示", level3: "一部のみ", level1: "なし" }, exampleGood: "今回は○○について説明します", exampleBad: "何の話か不明", studyHint: "開始30秒以内に「この発表が目指すゴール」を聞き手に提示する癖をつけましょう。" },
            { label: "話題転換", rubric: { level5: "接続語あり", level3: "一部のみ", level1: "突然" }, exampleGood: "次に〜と接続", exampleBad: "急に話が変わる", studyHint: "スライドが変わる際に「ここまでが〇〇で、次は▢▢の話に移ります」と境界線を口頭で伝えましょう。" },
            { label: "論理順序", rubric: { level5: "背景→方法→結果", level3: "やや乱れ", level1: "無秩序" }, exampleGood: "順序が明確", exampleBad: "バラバラ", studyHint: "聞き手が「なぜその話になるのか」疑問を持たないよう、時系列や因果関係の順に並べ替えましょう。" },
            { label: "まとめ", rubric: { level5: "整理されている", level3: "軽いまとめ", level1: "なし" }, exampleGood: "要点整理あり", exampleBad: "まとめなし", studyHint: "最後に「今日覚えて帰ってほしいこと」を3つ以内の箇条書きで1スライドにまとめましょう。" },
        ],
    },
    {
        title: "話し方",
        points: [
            { label: "音量", rubric: { level5: "十分", level3: "一部弱い", level1: "聞こえない" }, exampleGood: "全体に聞こえる", exampleBad: "小さい声", studyHint: "部屋の最後列にいる人に声を届ける意識を持ち、腹式呼吸で声を前に出す練習をしましょう。" },
            { label: "速度", rubric: { level5: "一定", level3: "やや不安定", level1: "乱れ" }, exampleGood: "安定した速度", exampleBad: "速すぎる/遅すぎる", studyHint: "緊張すると早口になりがちです。自分が「少し遅すぎる、間伸びしている」と感じる速度が丁度良いです。" },
            { label: "発音", rubric: { level5: "明瞭", level3: "やや不明瞭", level1: "不明瞭" }, exampleGood: "はっきり発音", exampleBad: "聞き取りづらい", studyHint: "口を普段の1.2倍大きく開けて、一文字ずつ丁寧に声を落とすイメージで発声してみましょう。" },
            { label: "間", rubric: { level5: "適切", level3: "弱い", level1: "なし" }, exampleGood: "重要箇所で間", exampleBad: "間がない", studyHint: "重要なキーワードを言った後は、頭の中で「1、2」と数えて2秒間あえて沈黙を作ってみてください。" },
        ],
    },
    {
        title: "非言語",
        points: [
            { label: "視線", rubric: { level5: "聴衆を見る", level3: "一部のみ", level1: "下向き" }, exampleGood: "全体を見る", exampleBad: "下ばかり", studyHint: "原稿を見る時間を減らし、会場の左・中・右からそれぞれ1人ずつターゲットを決めて目を合わせましょう。" },
            { label: "姿勢", rubric: { level5: "安定", level3: "やや揺れ", level1: "不安定" }, exampleGood: "安定した姿勢", exampleBad: "ふらつく", studyHint: "両足を肩幅に開き、重心を真ん中に固定します。無駄に体を左右に揺らさないよう意識しましょう。" },
            { label: "表情", rubric: { level5: "自然", level3: "やや硬い", level1: "固定" }, exampleGood: "自然な表情", exampleBad: "無表情", studyHint: "話し始めの一歩目に、意識的に口角を少し上げて少し微笑むような表情を作ると緊張も和らぎます。" },
            { label: "ジェスチャー", rubric: { level5: "適切", level3: "少ない", level1: "なし" }, exampleGood: "説明と連動", exampleBad: "動きなし", studyHint: "「3つあります」の時に指を3本立てるなど、数字や大きさ（拡大・縮小）を表す動きから始めてみましょう。" },
        ],
    },
    {
        title: "資料",
        points: [
            { label: "文字サイズ", rubric: { level5: "見やすい", level3: "やや小さい", level1: "読めない" }, exampleGood: "後方からも見える", exampleBad: "小さすぎる", studyHint: "スライドの文字は最小でも24pt以上を意識し、文章ではなく短いフレーズで箇条書きにしましょう。" },
            { label: "情報量", rubric: { level5: "適切", level3: "やや多い", level1: "過剰" }, exampleGood: "1スライド1テーマ", exampleBad: "情報過多", studyHint: "「1スライド＝1メッセージ」を徹底し、書ききれない補足データは口頭でカバーしましょう。" },
            { label: "視認性", rubric: { level5: "明確", level3: "普通", level1: "見づらい" }, exampleGood: "コントラスト良好", exampleBad: "見えない", studyHint: "背景白に薄いグレーの文字などを見づらくする原因です。ベース・メイン・アクセントの3色に絞りましょう。" },
            { label: "図表", rubric: { level5: "効果的", level3: "一部", level1: "なし" }, exampleGood: "図で理解促進", exampleBad: "文章のみ", studyHint: "テキストだけで説明している部分を、矢印（プロセス）や四角い枠（グループ化）の図解に変換できないか検討しましょう。" },
        ],
    },
    {
        title: "質疑応答",
        points: [
            { label: "質問理解", rubric: { level5: "正確理解", level3: "一部ずれ", level1: "誤解" }, exampleGood: "質問を言い換えて確認", exampleBad: "誤解して回答", studyHint: "質問されたらすぐ答えず、「ご質問は〇〇という認識で合っていますか？」とワンクッション挟みましょう。" },
            { label: "回答構造", rubric: { level5: "結論→理由", level3: "やや崩れ", level1: "無構造" }, exampleGood: "結論から回答", exampleBad: "長くて不明瞭", studyHint: "質疑でも結論ファーストです。「結論から申し上げますと、〜です。理由は3点あります」の型を使いましょう。" },
            { label: "適合性", rubric: { level5: "一致", level3: "ややずれ", level1: "不一致" }, exampleGood: "質問に正確回答", exampleBad: "論点ずれ", studyHint: "分からない質問に対して嘘をついたり誤魔化したりせず、「その点については未確認のため、後ほど確認し共有します」と答えましょう。" },
            { label: "安定性", rubric: { level5: "安定", level3: "やや動揺", level1: "混乱" }, exampleGood: "落ち着いて回答", exampleBad: "焦っている", studyHint: "鋭い指摘がきても攻撃されたと思わず、「貴重なご指摘ありがとうございます」と一度受け止める心構えが大切です。" },
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

const getRubricText = (rubric: Rubric, score: number): string => {
    if (score >= 5) return rubric.level5;
    if (score >= 3) return rubric.level3;
    return rubric.level1;
};

/* =========================
   メインコンポーネント
========================= */

export default function AdvancedReportSystem() {
    const [selfScores, setSelfScores] = useState<State>(() => createInitialState());
    const [evaluators, setEvaluators] = useState<Evaluator[]>([
        { id: "1", name: "評価者 A", scores: createInitialState() },
    ]);
    const [activeTab, setActiveTab] = useState<"self" | "other" | "report">("self");
    const [activeEvaluatorId, setActiveEvaluatorId] = useState<string>("1");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSelfScoreChange = (section: string, point: string, value: number) => {
        setSelfScores((prev) => ({
            ...prev,
            [section]: { ...(prev[section] ?? {}), [point]: value },
        }));
    };

    const handleOtherScoreChange = (evaluatorId: string, section: string, point: string, value: number) => {
        setEvaluators((prev) =>
            prev.map((ev) =>
                ev.id === evaluatorId
                    ? {
                        ...ev,
                        scores: {
                            ...ev.scores,
                            [section]: { ...(ev.scores[section] ?? {}), [point]: value },
                        },
                    }
                    : ev
            )
        );
    };

    const addEvaluator = () => {
        const newId = (Math.max(...evaluators.map((e) => parseInt(e.id))) + 1).toString();
        const newEvaluator: Evaluator = {
            id: newId,
            name: `評価者 ${String.fromCharCode(64 + parseInt(newId))}`,
            scores: createInitialState(),
        };
        setEvaluators([...evaluators, newEvaluator]);
        setActiveEvaluatorId(newId);
    };

    const removeEvaluator = (id: string) => {
        if (evaluators.length <= 1) return;
        const filtered = evaluators.filter((e) => e.id !== id);
        setEvaluators(filtered);
        setActiveEvaluatorId(filtered[0].id);
    };

    /* =========================
       学習・多角分析ロジック
    ========================= */

    const chartData = useMemo(() => {
        return evaluationItems.map((item) => {
            const selfVals = Object.values(selfScores[item.title] ?? {});
            const selfAvg = selfVals.length ? selfVals.reduce((a, b) => a + b, 0) / selfVals.length : 0;

            let totalOtherSum = 0;
            let totalOtherCount = 0;
            const otherAvgsOfEachEvaluator: number[] = [];

            evaluators.forEach((ev) => {
                const evVals = Object.values(ev.scores[item.title] ?? {});
                if (evVals.length) {
                    const evAvg = evVals.reduce((a, b) => a + b, 0) / evVals.length;
                    otherAvgsOfEachEvaluator.push(evAvg);
                    totalOtherSum += evVals.reduce((a, b) => a + b, 0);
                    totalOtherCount += evVals.length;
                }
            });

            const otherAvg = totalOtherCount ? totalOtherSum / totalOtherCount : 0;
            const otherMin = otherAvgsOfEachEvaluator.length ? Math.min(...otherAvgsOfEachEvaluator) : 0;

            return {
                subject: item.title,
                self: parseFloat(selfAvg.toFixed(1)),
                otherAvg: parseFloat(otherAvg.toFixed(1)),
                otherMin: parseFloat(otherMin.toFixed(1)),
            };
        });
    }, [selfScores, evaluators]);

    // 新・学習視点の集計レポート
    const analysisReport = useMemo(() => {
        const items = chartData.map((d) => ({
            title: d.subject,
            gap: d.self - d.otherAvg,
            self: d.self,
            other: d.otherAvg,
        }));

        // 1. 【明白な欠点】他者評価平均が3.0未満（低い順）
        const clearWeaknesses = [...items].filter((item) => item.other < 3.0).sort((a, b) => a.other - b.other);

        // 2. 【認識の盲点】自己評価＞他者評価のギャップ大（乖離順）
        const blindSpots = [...items].filter((item) => item.gap > 0).sort((a, b) => b.gap - a.gap);

        const totalSelfScore = (items.reduce((acc, curr) => acc + curr.self, 0) / items.length) * 20;
        const totalOtherScore = (items.reduce((acc, curr) => acc + curr.other, 0) / items.length) * 20;

        // 💡 学習要素：メタ認知（客観視の力）スコア算出
        const totalAbsGap = items.reduce((acc, curr) => acc + Math.abs(curr.gap), 0) / items.length;
        let metaCognitionRank = "発展途上（客観的な基準を意識しよう）";
        let metaLevelColor = "text-amber-400";
        if (totalAbsGap <= 0.4) {
            metaCognitionRank = "🌟 達人（完ぺきな自己分析力）";
            metaLevelColor = "text-emerald-400";
        } else if (totalAbsGap <= 0.8) {
            metaCognitionRank = "👍 的確（優れた客観視力）";
            metaLevelColor = "text-indigo-400";
        }

        // 💡 学習要素：動的成長アクションプランの生成（最大3つのToDo）
        const actionPlans: string[] = [];
        if (clearWeaknesses.length > 0) {
            const hint = evaluationItems.find(i => i.title === clearWeaknesses[0].title)?.points[0].studyHint || "";
            actionPlans.push(`【最優先スキル改善】『${clearWeaknesses[0].title}』の強化：${hint}`);
        }
        if (blindSpots.length > 0 && blindSpots[0].gap > 0.5) {
            const hint = evaluationItems.find(i => i.title === blindSpots[0].title)?.points[0].studyHint || "";
            actionPlans.push(`【認識のズレ修正】『${blindSpots[0].title}』において周囲の視線を意識：${hint}`);
        }
        if (actionPlans.length === 0) {
            actionPlans.push("🎉 素晴らしい！現在の高いクオリティを維持しつつ、さらに応用的な図解や表現の工夫に挑戦しましょう。");
        }

        return { clearWeaknesses, blindSpots, totalSelfScore, totalOtherScore, metaCognitionRank, metaLevelColor, actionPlans };
    }, [chartData]);

    /* =========================
       インポート・エクスポート
    ========================= */
    const exportData = () => {
        const dataStr = JSON.stringify({ selfScores, evaluators }, null, 2);
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const exportFileDefaultName = `learning_report_${new Date().toISOString().slice(0, 10)}.json`;

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
                    if (parsed.selfScores && parsed.evaluators) {
                        setSelfScores(parsed.selfScores);
                        setEvaluators(parsed.evaluators);
                        setActiveEvaluatorId(parsed.evaluators[0].id);
                        alert("評価データを正常に読み込みました。学習を再開します。");
                    }
                } catch {
                    alert("ファイル読み込みに失敗しました。");
                }
            };
        }
    };

    return (
        <main className="p-4 md:p-8 bg-slate-900 min-h-screen text-slate-100 antialiased">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* ヘッダー：新タイトル適用 */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-wider text-white">自他分析から学ぶプレゼン向上室</h1>
                        <p className="text-emerald-100 text-xs mt-1">「スキルの未達」と「メタ認識のズレ」を可視化するセルフ・トレーニングルーム</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportData} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold transition-all">📥 カルテ保存</button>
                        <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold transition-all">📤 カルテ読込</button>
                        <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
                    </div>
                </div>

                {/* ナビゲーション */}
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button onClick={() => setActiveTab("self")} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === "self" ? "bg-teal-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}>🙋‍♂️ 自己評価（現在の予測）</button>
                    <button onClick={() => setActiveTab("other")} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === "other" ? "bg-teal-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}>👥 他者評価（オーディエンスの目）</button>
                    <button onClick={() => setActiveTab("report")} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === "report" ? "bg-gradient-to-r from-emerald-600 to-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}>📊 成長分析カルテ</button>
                </div>

                {/* =========================
           自己評価タブ
        ========================= */}
                {activeTab === "self" && (
                    <div className="space-y-6 animate-fadeIn">
                        {evaluationItems.map((item) => (
                            <div key={item.title} className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-sm space-y-4">
                                <h3 className="text-base font-bold text-teal-400 bg-teal-950/60 border border-teal-900/50 px-3 py-1.5 rounded-lg inline-block">{item.title}</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {item.points.map((p) => {
                                        const score = selfScores[item.title]?.[p.label] ?? 3;
                                        return (
                                            <div key={p.label} className="border border-slate-700/60 rounded-xl p-4 bg-slate-900/50 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-sm text-slate-200">{p.label}</span>
                                                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">自分の想定: {score}</span>
                                                    </div>
                                                    <p className="text-xs text-teal-300 font-medium mb-3 min-h-[2rem] bg-teal-950/40 p-2 rounded border border-teal-900/40">💡 基準: {getRubricText(p.rubric, score)}</p>
                                                    <div className="space-y-1 mb-4 text-[11px] text-slate-400">
                                                        <div className="flex items-start gap-1"><span className="text-emerald-500">✔</span><span>{p.exampleGood}</span></div>
                                                        <div className="flex items-start gap-1"><span className="text-rose-500">✖</span><span>{p.exampleBad}</span></div>
                                                    </div>
                                                </div>
                                                <input type="range" min="1" max="5" step="1" value={score} onChange={(e) => handleSelfScoreChange(item.title, p.label, Number(e.target.value))} className="w-full accent-teal-500 bg-slate-700 h-1.5 rounded" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* =========================
           他者評価タブ
        ========================= */}
                {activeTab === "other" && (
                    <div className="space-y-6">
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                                {evaluators.map((ev) => (
                                    <div key={ev.id} className="relative group">
                                        <button onClick={() => setActiveEvaluatorId(ev.id)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border ${activeEvaluatorId === ev.id ? "bg-teal-600 text-white border-teal-500 shadow-md" : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"}`}>{ev.name}</button>
                                        {evaluators.length > 1 && (
                                            <button onClick={() => removeEvaluator(ev.id)} className="absolute -top-1 -right-1 bg-rose-600 text-white w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button onClick={addEvaluator} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-xs font-bold rounded-lg transition-all">＋ 新しい評価シートを追加</button>
                        </div>

                        {evaluators.map((ev) => {
                            if (ev.id !== activeEvaluatorId) return null;
                            return (
                                <div key={ev.id} className="space-y-6 animate-fadeIn">
                                    {evaluationItems.map((item) => (
                                        <div key={item.title} className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-sm space-y-4">
                                            <h3 className="text-base font-bold text-teal-400 bg-teal-950/60 border border-teal-900/50 px-3 py-1.5 rounded-lg inline-block">{item.title}</h3>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {item.points.map((p) => {
                                                    const score = ev.scores[item.title]?.[p.label] ?? 3;
                                                    return (
                                                        <div key={p.label} className="border border-slate-700/60 rounded-xl p-4 bg-slate-900/50 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="font-bold text-sm text-slate-200">{p.label}</span>
                                                                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 border border-slate-600">観客スコア: {score}</span>
                                                                </div>
                                                                <p className="text-xs text-slate-400 bg-slate-900/40 p-2 rounded min-h-[2rem]">基準該当: {getRubricText(p.rubric, score)}</p>
                                                            </div>
                                                            <input type="range" min="1" max="5" step="1" value={score} onChange={(e) => handleOtherScoreChange(ev.id, item.title, p.label, Number(e.target.value))} className="w-full accent-emerald-500 bg-slate-700 h-1.5 rounded" />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* =========================
           成長分析カルテ（学習特化）
        ========================= */}
                {activeTab === "report" && (
                    <div className="space-y-6 animate-fadeIn">

                        {/* メタ認知スコア層 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center md:col-span-1 flex flex-col justify-center">
                                <div className="text-slate-400 text-xs font-semibold">🔍 メタ認知レベル（自己分析の正確性）</div>
                                <div className={`text-lg font-black mt-1 ${analysisReport.metaLevelColor}`}>{analysisReport.metaCognitionRank}</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-2 gap-2 md:col-span-2">
                                <div className="text-center border-r border-slate-700">
                                    <div className="text-slate-400 text-[11px]">自己評価アベレージ</div>
                                    <div className="text-xl font-black text-indigo-400 mt-0.5">{analysisReport.totalSelfScore.toFixed(1)}点</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-slate-400 text-[11px]">オーディエンス平均</div>
                                    <div className="text-xl font-black text-emerald-400 mt-0.5">{analysisReport.totalOtherScore.toFixed(1)}点</div>
                                </div>
                            </div>
                        </div>

                        {/* メインビュー */}
                        <div className="grid md:grid-cols-3 gap-6">

                            <div className="md:col-span-2 bg-slate-800 p-5 rounded-2xl border border-slate-700">
                                <h2 className="text-base font-bold text-slate-200 mb-1">📊 自他レーダー比較（分析図）</h2>
                                <div className="w-full flex justify-center">
                                    <ResponsiveContainer width="100%" height={340}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                            <PolarGrid stroke="#475569" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                            <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fill: '#475569', fontSize: 10 }} />
                                            <Radar name="自己想定" dataKey="self" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                                            <Radar name="客観平均" dataKey="otherAvg" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                                            <Radar name="最も厳しい視点" dataKey="otherMin" stroke="#f59e0b" fill="none" strokeWidth={1} strokeDasharray="3 3" />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 分析＆次へのステップ（学習パネル） */}
                            <div className="space-y-4">

                                {/* 課題の2軸分類表示 */}
                                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-3">
                                    <div>
                                        <h3 className="text-xs font-bold text-red-400 flex items-center gap-1">🚨 明白な欠点（自他共通の課題）</h3>
                                        <div className="mt-1 space-y-1">
                                            {analysisReport.clearWeaknesses.length === 0 ? (
                                                <p className="text-[10px] text-slate-400 pl-2">特にありません。標準スコア以上です！</p>
                                            ) : (
                                                analysisReport.clearWeaknesses.slice(0, 2).map(w => (
                                                    <div key={w.title} className="text-[11px] bg-slate-900/60 p-1.5 rounded border border-slate-700 flex justify-between">
                                                        <span className="text-slate-200 font-medium">・{w.title}</span>
                                                        <span className="text-red-400 font-bold">客観 {w.other}点</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1">⚠️ 認識の盲点（見落としているズレ）</h3>
                                        <div className="mt-1 space-y-1">
                                            {analysisReport.blindSpots.filter(b => b.gap > 0.4).length === 0 ? (
                                                <p className="text-[10px] text-slate-400 pl-2">周囲との大きな認識のズレはありません。</p>
                                            ) : (
                                                analysisReport.blindSpots.filter(b => b.gap > 0.4).slice(0, 2).map(w => (
                                                    <div key={w.title} className="text-[11px] bg-slate-900/60 p-1.5 rounded border border-slate-700 flex justify-between">
                                                        <span className="text-slate-200 font-medium">・{w.title}</span>
                                                        <span className="text-amber-400 font-bold">ギャップ +{w.gap.toFixed(1)}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 💡 進化機能：次回の練習用 アクションプラン */}
                                <div className="bg-gradient-to-br from-teal-950/40 to-indigo-950/40 p-5 rounded-2xl border border-teal-500/20 shadow-xl">
                                    <h3 className="text-xs font-bold text-teal-400 mb-3 flex items-center gap-1.5">🏃‍♂️ 次回への学習アクションプラン</h3>
                                    <div className="space-y-3">
                                        {analysisReport.actionPlans.map((plan, index) => (
                                            <div key={index} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
                                                <input type="checkbox" className="mt-0.5 rounded text-teal-600 accent-teal-500" />
                                                <span>{plan}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}