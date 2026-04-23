import { useEffect, useState } from 'react'
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronDown,
  FiRefreshCw,
  FiShield,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi'

const FEATURE_GROUPS = [
  ['Time', 'Amount'],
  ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14'],
  ['V15', 'V16', 'V17', 'V18', 'V19', 'V20', 'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28'],
]

const createEmptyForm = () => {
  const values = {}
  FEATURE_GROUPS.flat().forEach((feature) => {
    values[feature] = feature === 'Amount' ? '149.62' : '0'
  })
  return values
}

function App() {
  const [formValues, setFormValues] = useState(createEmptyForm)
  const [examples, setExamples] = useState({ legitimate: null, fraud: null })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [threshold, setThreshold] = useState(0.5)

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const response = await fetch('/api/features')
        if (!response.ok) {
          throw new Error('Could not load model features')
        }
        const data = await response.json()
        setExamples(data.examples || { legitimate: null, fraud: null })
        setThreshold(data.threshold ?? 0.5)
      } catch (err) {
        setError(err.message)
      }
    }

    loadFeatures()
  }, [])

  const handleChange = (feature, value) => {
    setFormValues((current) => ({
      ...current,
      [feature]: value,
    }))
  }

  const handleLoadExample = (type) => {
    const selectedExample = examples[type]
    if (!selectedExample) {
      return
    }

    const nextValues = {}
    Object.entries(selectedExample).forEach(([feature, value]) => {
      nextValues[feature] = String(value)
    })

    setFormValues((current) => ({
      ...current,
      ...nextValues,
    }))
    setResult(null)
    setError('')
  }

  const handleReset = () => {
    setFormValues(createEmptyForm())
    setResult(null)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const payload = {}
      Object.entries(formValues).forEach(([feature, value]) => {
        payload[feature] = Number(value || 0)
      })

      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed')
      }

      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grid-overlay" />

      <header className="hero">
        <div className="brand-pill">
          <FiShield />
          <span>FraudShield AI</span>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">Smart Fraud Detection Platform</p>
          <h1>Catch suspicious transactions with a cleaner, lighter workflow.</h1>
          <p className="hero-text">
            Review payment risk in seconds. Use the quick examples below or enter your own values
            to check whether a transaction looks safe or suspicious.
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <FiTarget />
            <div>
              <strong>Balanced detection</strong>
              <span>Set up to return both legitimate and fraud outcomes</span>
            </div>
          </div>
          <div className="stat-card">
            <FiTrendingUp />
            <div>
              <strong>Faster testing</strong>
              <span>Try safe and fraud sample inputs without typing everything</span>
            </div>
          </div>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel predictor-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Prediction Console</p>
              <h2>Run a transaction check</h2>
            </div>
            <div className="chip-row">
              <span className="chip">Quick check</span>
              <span className="chip">Detailed inputs</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="quick-grid">
              {FEATURE_GROUPS[0].map((feature) => (
                <label className="input-card input-card-large" key={feature}>
                  <span>{feature}</span>
                  <input
                    type="number"
                    step="any"
                    value={formValues[feature]}
                    onChange={(event) => handleChange(feature, event.target.value)}
                    placeholder={`Enter ${feature}`}
                  />
                </label>
              ))}
            </div>

            <details className="advanced-panel">
              <summary>
                <span>Advanced model signals</span>
                <FiChevronDown />
              </summary>
              <p className="advanced-copy">
                These values are required by the trained fraud model. They stay hidden until you
                need a full manual check.
              </p>

              {FEATURE_GROUPS.slice(1).map((group, index) => (
                <div className="advanced-group" key={`group-${index}`}>
                  <h3>{index === 0 ? 'Core latent signals' : 'Extended latent signals'}</h3>
                  <div className="advanced-grid">
                    {group.map((feature) => (
                      <label className="input-card" key={feature}>
                        <span>{feature}</span>
                        <input
                          type="number"
                          step="any"
                          value={formValues[feature]}
                          onChange={(event) => handleChange(feature, event.target.value)}
                          placeholder={feature}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </details>

            <div className="action-row">
              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Transaction'}
              </button>
              <button className="ghost-btn" type="button" onClick={() => handleLoadExample('legitimate')}>
                <FiCheckCircle />
                Try Safe Example
              </button>
              <button className="ghost-btn" type="button" onClick={() => handleLoadExample('fraud')}>
                <FiAlertTriangle />
                Try Fraud Example
              </button>
              <button className="ghost-btn" type="button" onClick={handleReset}>
                <FiRefreshCw />
                Reset
              </button>
            </div>
          </form>
        </section>

        <aside className="panel insights-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Decision Summary</p>
              <h2>Live response</h2>
            </div>
          </div>

          {!result && !error && (
            <div className="empty-state">
              <FiShield />
              <p>Submit a transaction to view the fraud signal and confidence score.</p>
            </div>
          )}

          {error && (
            <div className="status-card status-error">
              <FiAlertTriangle />
              <div>
                <strong>Prediction error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className={`status-card ${result.isFraud ? 'status-fraud' : 'status-safe'}`}>
              {result.isFraud ? <FiAlertTriangle /> : <FiCheckCircle />}
              <div>
                <strong>{result.result}</strong>
                <p>
                  Fraud probability: <span>{(result.probability * 100).toFixed(2)}%</span>
                </p>
                <p>
                  Decision threshold: <span>{(threshold * 100).toFixed(2)}%</span>
                </p>
              </div>
            </div>
          )}

          <div className="info-stack">
            <div className="info-card">
              <span className="info-label">Name</span>
              <strong>FraudShield AI</strong>
            </div>
            <div className="info-card">
              <span className="info-label">Result</span>
              <strong>Shows class and fraud probability together</strong>
            </div>
            <div className="info-card">
              <span className="info-label">Input</span>
              <strong>Quick examples plus full manual values</strong>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
