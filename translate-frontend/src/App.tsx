import 'bootstrap/dist/css/bootstrap.min.css'
import { useEffect } from 'react'
import { useDebounce } from './hooks/useDebounce'
import { Container, Row, Col, Button, Stack } from 'react-bootstrap'

import './App.css'
import { ArrowsIcon, ClipboardIcon, SpeakerIcon } from './components/Icons'
import { TextArea } from './components/TextArea'
import { AUTO_LANGUAGE, VOICE_FOR_LANGUAGE } from './constants'
import { useStore } from './hooks/useStore'
import { translate } from './services/translate'
import { SectionType } from './types.d'
import { LanguageSelector } from './components/LenguageSelector'

function App() {
  const {
    loading,
    fromLanguage,
    toLanguage,
    fromText,
    result,
    interchangeLanguages,
    setFromLanguage,
    setToLanguage,
    setFromText,
    setResult
  } = useStore()

  const debouncedFromText = useDebounce(fromText, 300)

  useEffect(() => {
    if (debouncedFromText === '') return

    translate({ fromLanguage, toLanguage, text: debouncedFromText })
      .then(result => {
        if (result == null) return
        setResult(result)
      })
      .catch(() => { setResult('Error') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFromText, fromLanguage, toLanguage])

  const handleClipboard = () => {
    navigator.clipboard.writeText(result).catch(() => { })
  }

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(result)
    utterance.lang = VOICE_FOR_LANGUAGE[toLanguage]
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="app-wrapper">
      <div className="background-gradient"></div>

      <Container fluid className="app-container">
        <div className="header-section">
          <h1 className="app-title">
            <span className="title-icon">🌐</span>
            AI Translator
          </h1>
          <p className="app-subtitle">Traduce instantáneamente con inteligencia artificial</p>
        </div>

        <div className="translator-card">
          <Row className="g-4">
            <Col lg={5} md={12}>
              <Stack gap={3}>
                <LanguageSelector
                  type={SectionType.From}
                  value={fromLanguage}
                  onChange={setFromLanguage}
                />

                <TextArea
                  type={SectionType.From}
                  value={fromText}
                  onChange={setFromText}
                />
              </Stack>
            </Col>

            <Col lg={2} md={12} className="d-flex align-items-center justify-content-center">
              <Button
                className="interchange-btn"
                disabled={fromLanguage === AUTO_LANGUAGE}
                onClick={interchangeLanguages}
              >
                <ArrowsIcon />
              </Button>
            </Col>

            <Col lg={5} md={12}>
              <Stack gap={3}>
                <LanguageSelector
                  type={SectionType.To}
                  value={toLanguage}
                  onChange={setToLanguage}
                />
                <div className="result-container">
                  <TextArea
                    loading={loading}
                    type={SectionType.To}
                    value={result}
                    onChange={setResult}
                  />
                  <div className="action-buttons">
                    <Button
                      className="action-btn"
                      onClick={handleClipboard}
                      title="Copiar al portapapeles"
                    >
                      <ClipboardIcon />
                    </Button>
                    <Button
                      className="action-btn"
                      onClick={handleSpeak}
                      title="Escuchar traducción"
                    >
                      <SpeakerIcon />
                    </Button>
                  </div>
                </div>
              </Stack>
            </Col>
          </Row>
        </div>

      </Container>
    </div>
  )
}

export default App