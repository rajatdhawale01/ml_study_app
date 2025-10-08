/* global React, ReactDOM */
const { useState, useMemo, useEffect, useCallback } = React;

// Helpers
const P = (name, desc="") => ({ name, desc });
const D = (url) => url;
const T = (txt) => txt;

const UNIVERSAL_PARAMS = [
  P("random_state", "Seed for reproducibility"),
  P("n_jobs", "Parallel (if supported)"),
  P("max_iter", "Max training iterations"),
  P("tol", "Optimization tolerance"),
  P("early_stopping", "Stop when validation plateaus"),
];

const METRICS = {
  classification: [
    { name: "Accuracy", tip: "Misleading with imbalance" },
    { name: "Precision/Recall/F1", tip: "Positive class trade-off" },
    { name: "ROC-AUC", tip: "Ranking quality" },
    { name: "PR-AUC", tip: "Better for rare positives" },
  ],
  regression: [
    { name: "MAE", tip: "Robust to outliers" },
    { name: "RMSE", tip: "Penalizes large errors" },
    { name: "R²", tip: "Explained variance" },
  ],
};

// Catalog (compact but useful)
const CATALOG = {
  name: "Machine Learning",
  theory: T("ML learns patterns from data. Pipeline: framing → data/EDA → features → CV → train → evaluate → select/tune → deploy → monitor. Avoid leakage; fit preprocessing on train folds only."),
  children: [
    {
      name: "Supervised Learning",
      theory: T("Learn from labeled (x,y)."),
      children: [
        {
          name: "Classification",
          theory: T("Predict labels/probabilities. Handle imbalance; tune thresholds; inspect confusion matrix."),
          children: [
            {
              name: "Linear / GLM",
              theory: T("Fast baselines; regularization controls variance; interpretable coefficients."),
              children: [
                {
                  type: "model",
                  name: "LogisticRegression (sklearn)",
                  docs: D("https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html"),
                  theory: T("Linear log-odds baseline; supports L1/L2/ElasticNet via solver."),
                  params: [P("penalty"), P("C","Inverse reg"), P("solver"), P("max_iter")],
                },
              ],
            },
            {
              name: "Kernel / Margin",
              theory: T("SVM margin maximization; tune C and gamma; scale features."),
              children: [
                {
                  type: "model",
                  name: "SVC (sklearn)",
                  docs: D("https://scikit-learn.org/stable/modules/generated/sklearn.svm.SVC.html"),
                  theory: T("RBF/poly kernels; strong on medium data; probabilities need calibration."),
                  params: [P("kernel"), P("C"), P("gamma"), P("degree")],
                },
              ],
            },
            {
              name: "Distance-based",
              theory: T("Instance-based; requires scaling; beware high dimensions."),
              children: [
                {
                  type: "model",
                  name: "KNeighborsClassifier (sklearn)",
                  docs: D("https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.KNeighborsClassifier.html"),
                  theory: T("Vote among k nearest; latency grows with data size."),
                  params: [P("n_neighbors"), P("weights"), P("metric")],
                },
              ],
            },
            {
              name: "Trees & Ensembles",
              theory: T("Trees split feature space; bagging reduces variance; boosting fits residuals stage-wise."),
              children: [
                {
                  type: "model",
                  name: "DecisionTreeClassifier (sklearn)",
                  docs: D("https://scikit-learn.org/stable/modules/generated/sklearn.tree.DecisionTreeClassifier.html"),
                  theory: T("Interpretable but high-variance; limit depth/leaves."),
                  params: [P("max_depth"), P("min_samples_split"), P("min_samples_leaf"), P("max_features")],
                },
                {
                  type: "model",
                  name: "RandomForestClassifier (sklearn)",
                  docs: D("https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html"),
                  theory: T("Bagged trees; robust baseline; OOB estimate."),
                  params: [P("n_estimators"), P("max_depth"), P("max_features")],
                },
              ],
            },
          ],
        },
        {
          name: "Regression",
          theory: T("Predict continuous targets; start linear; ensembles for non-linearity; inspect residuals."),
          children: [
            {
              name: "Linear / Regularized / GLM",
              theory: T("OLS; Ridge(L2) stabilizes; Lasso(L1) sparsifies; ElasticNet blends."),
              children: [
                {
                  type: "model",
                  name: "LinearRegression (sklearn)",
                  docs: D("https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html"),
                  theory: T("Least squares via QR/SVD; sensitive to outliers/collinearity."),
                  params: [P("fit_intercept")],
                },
                {
                  type: "model",
                  name: "SVR (sklearn)",
                  docs: D("https://scikit-learn.org/stable/modules/generated/sklearn.svm.SVR.html"),
                  theory: T("Kernel regression with ε-insensitive loss; scale features."),
                  params: [P("kernel"), P("C"), P("epsilon"), P("gamma")],
                },
              ],
            },
            {
              name: "Trees & Ensembles",
              theory: T("Trees piecewise-constant; RF averages; boosting adds trees stage-wise."),
              children: [
                {
                  type: "model",
                  name: "RandomForestRegressor (sklearn)",
                  docs: D("https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html"),
                  theory: T("Averaging randomized trees → robust baseline."),
                  params: [P("n_estimators"), P("max_depth"), P("max_features")],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Unsupervised Learning",
      theory: T("Structure without labels: clustering, DR, anomalies."),
      children: [
        {
          name: "Clustering",
          theory: T("Centroid (K-Means), density (DBSCAN), probabilistic (GMM)."),
          children: [
            {
              type: "model",
              name: "KMeans (sklearn)",
              docs: D("https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html"),
              theory: T("Minimize within-cluster variance; choose k via elbow/silhouette; scale features."),
              params: [P("n_clusters"), P("n_init"), P("max_iter")],
            },
          ],
        },
        {
          name: "Dimensionality Reduction",
          theory: T("PCA linear; UMAP/t-SNE for viz."),
          children: [
            {
              type: "model",
              name: "PCA (sklearn)",
              docs: D("https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html"),
              theory: T("Project to principal components; check explained_variance_ratio_."),
              params: [P("n_components")],
            },
          ],
        },
      ],
    },
    {
      name: "Reinforcement Learning",
      theory: T("MDP with states, actions, rewards; learn a policy π(a|s) maximizing expected return."),
      items: ["Value-based: DQN/Double/dueling", "Policy gradient: REINFORCE/A2C", "Actor-critic: PPO/SAC/TD3"],
    },
  ],
};

// UI bits
const ParamBadge = ({ name }) => (
  <span className="inline-block text-xs bg-gray-100 border border-gray-200 rounded px-2 py-0.5 mr-1 mb-1">{name}</span>
);

function ModelPanel({ model }) {
  if (!model) return <div className="text-gray-500 text-sm">Select a model to see theory, parameters & docs.</div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-lg font-semibold">{model.name}</div>
        {model.docs && <a href={model.docs} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-full border hover:bg-gray-50">Docs ↗</a>}
      </div>
      {model.theory && <div className="text-sm bg-indigo-50 border border-indigo-100 rounded-md p-2 mb-2">{model.theory}</div>}
      <div className="mb-2">
        <div className="text-sm font-medium mb-1">Common parameters</div>
        <div className="flex flex-wrap">{UNIVERSAL_PARAMS.map((p) => <ParamBadge key={p.name} name={p.name} />)}</div>
      </div>
      <div>
        <div className="text-sm font-medium mb-1">Model-specific parameters</div>
        <ul className="list-disc pl-5 text-sm">
          {(model.params || []).map((p) => (
            <li key={p.name} className="mb-1">
              <span className="font-medium">{p.name}</span>
              {p.desc && <span className="text-gray-600"> — {p.desc}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Chevron({ open }) {
  return (
    <span className="inline-block mr-2 select-none" style={{ transform: `rotate(${open ? 90 : 0}deg)`, transition: "transform 150ms" }}>▶</span>
  );
}

function NodeView({ node, depth=0, onSelectModel, filter }) {
  const [open, setOpen] = useState(depth < 1);
  const isModel = node.type === "model";
  const lower = (s) => (s || "").toLowerCase();
  const matches = (txt) => lower(txt).includes(lower(filter));

  const visible = useMemo(() => {
    if (!filter) return true;
    const rec = (n) => {
      if (n.type === "model") {
        return matches(n.name) || matches(n.theory || "") || (n.params || []).some((p) => matches(p.name));
      }
      return matches(n.name) || matches(n.theory || "") || (n.items || []).some(matches) || (n.children || []).some(rec);
    };
    return rec(node);
  }, [filter, node]);

  if (!visible) return null;

  if (isModel) {
    return (
      <div className="pl-3 border-l border-gray-300 ml-2 my-1">
        <button onClick={() => onSelectModel(node)} className="w-full text-left rounded-lg px-2 py-1 hover:bg-gray-50">
          <div className="text-sm font-medium">{node.name}</div>
        </button>
      </div>
    );
  }

  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const hasItems = Array.isArray(node.items) && node.items.length > 0;

  return (
    <div className="my-1">
      <div className="flex items-start gap-2">
        {hasChildren || hasItems ? (
          <button onClick={() => setOpen((o) => !o)} className="flex items-center text-left hover:bg-gray-50 rounded-lg px-2 py-1">
            <Chevron open={open} />
            <span className="font-semibold">{node.name}</span>
          </button>
        ) : (
          <div className="pl-5 font-semibold">{node.name}</div>
        )}
        {node.theory && <span className="text-[11px] text-gray-500 mt-1 ml-2 hidden md:inline">— {node.theory}</span>}
      </div>
      {open && (
        <div className="pl-6 border-l border-gray-200 ml-2">
          {hasChildren && node.children.map((ch) =>
            <NodeView key={ch.name || Math.random()} node={ch} depth={depth+1} onSelectModel={onSelectModel} filter={filter} />
          )}
          {hasItems && (
            <ul className="list-disc pl-6 text-sm text-gray-700">
              {node.items.map((it) => <li key={it}>{it}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function MLMindMap() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");

  // TTS
  const [ttsOn, setTtsOn] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const load = () => {
      const vs = synth.getVoices();
      setVoices(vs);
      const preferred =
        vs.find((v) => /en-(IN|SG|GB|AU|PH)/i.test(v.lang) && /female|neural|natural/i.test(v.name)) ||
        vs.find((v) => /en/i.test(v.lang));
      if (preferred) setVoiceName(preferred.name);
    };
    load();
    synth.onvoiceschanged = load;
  }, []);

  const pickVoice = useCallback(() => voices.find((v) => v.name === voiceName) || voices[0], [voices, voiceName]);

  const speak = useCallback((text) => {
    if (!ttsOn || !text) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = rate; u.pitch = pitch; u.volume = volume;
    synth.speak(u);
  }, [ttsOn, rate, pitch, volume, pickVoice]);

  useEffect(() => {
    // auto speak on selection
    if (autoSpeak && selected) speak(selected.theory || selected.name);
  }, [selected, autoSpeak, speak]);

  // suggestions
  const allModels = useMemo(() => {
    const arr = [];
    const walk = (n) => { if (n.type === "model") arr.push(n); (n.children || []).forEach(walk); };
    walk(CATALOG);
    return arr;
  }, []);
  const suggestions = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return [];
    return allModels.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 8);
  }, [filter, allModels]);

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 md:mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Machine Learning — Interactive Mind Map</h1>
            <p className="text-gray-600 text-sm md:text-base">Expand nodes → select a model → hear theory & see parameters.</p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="relative max-w-md w-full">
              <input value={filter} onChange={(e)=>setFilter(e.target.value)} placeholder="Search (e.g., 'RandomForest', 'gamma', 'UMAP')" className="w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400" />
              {!!suggestions.length && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow max-h-64 overflow-auto">
                  {suggestions.map((m)=>(
                    <button key={m.name} onClick={()=>{setSelected(m); setFilter(m.name);}} className="block w-full text-left px-3 py-2 hover:bg-gray-50">{m.name}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <label className="flex items-center gap-1"><input type="checkbox" checked={ttsOn} onChange={(e)=>setTtsOn(e.target.checked)} /> TTS</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={autoSpeak} onChange={(e)=>setAutoSpeak(e.target.checked)} /> Auto-speak</label>
              <select className="border rounded px-2 py-1" value={voiceName} onChange={(e)=>setVoiceName(e.target.value)}>
                {voices.map((v)=><option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
              </select>
              <div className="flex items-center gap-1">Rate <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e)=>setRate(+e.target.value)} /></div>
              <div className="flex items-center gap-1">Pitch <input type="range" min="0" max="2" step="0.1" value={pitch} onChange={(e)=>setPitch(+e.target.value)} /></div>
              <div className="flex items-center gap-1">Vol <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e)=>setVolume(+e.target.value)} /></div>
              <div className="flex items-center gap-1">
                <button className="border rounded px-2 py-1" onClick={()=>selected && speak(selected.theory || selected.name)}>Speak</button>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-white shadow-sm p-4 lg:col-span-2">
            {selected?.theory && <div className="mb-3 text-sm bg-amber-50 border border-amber-100 rounded-md p-2">{selected.theory}</div>}
            <NodeView node={CATALOG} depth={0} onSelectModel={setSelected} filter={filter} />
          </div>

        <div className="rounded-2xl border bg-white shadow-sm p-4">
          <div className="mb-3">
            <h2 className="text-xl font-semibold">Details</h2>
            <p className="text-xs text-gray-500">Universal knobs apply widely; model-specific knobs below.</p>
          </div>
          <ModelPanel model={selected} />
          <div className="mt-6 border-t pt-4 grid grid-cols-1 gap-3">
            <div>
              <div className="text-sm font-medium mb-1">Universal parameters</div>
              <div className="flex flex-wrap">{UNIVERSAL_PARAMS.map((p)=><ParamBadge key={p.name} name={p.name} />)}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Metrics — Classification</div>
              <ul className="list-disc pl-5 text-sm text-gray-700">{METRICS.classification.map((m)=><li key={m.name}><span className="font-medium">{m.name}</span> — {m.tip}</li>)}</ul>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Metrics — Regression</div>
              <ul className="list-disc pl-5 text-sm text-gray-700">{METRICS.regression.map((m)=><li key={m.name}><span className="font-medium">{m.name}</span> — {m.tip}</li>)}</ul>
            </div>
          </div>
        </div>

        </div>

        <footer className="mt-8 text-xs text-gray-500">
          Tips: scale features for SVM/KNN; early stopping with boosting; handle imbalance via class weights/resampling; proper CV.
        </footer>
      </div>
    </div>
  );
}

// export + mount
window.MLMindMap = MLMindMap;
const rootEl = document.getElementById("ml-mind-map-root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(React.createElement(MLMindMap));
}
