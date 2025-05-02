"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clipboard, RefreshCw, Shield, ShieldAlert, ShieldCheck, Lock, ExternalLink, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [password, setPassword] = useState("")
  const [url, setUrl] = useState("")
  const [urlStatus, setUrlStatus] = useState<"idle" | "loading" | "safe" | "unsafe" | "error">("idle")
  const [urlDetails, setUrlDetails] = useState<any>(null)
  const [isTestDomain, setIsTestDomain] = useState(false)
  const { toast } = useToast()

  const generatePassword = () => {
    const length = 16
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-="
    let newPassword = ""

    // Ensure at least one of each character type
    newPassword += getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    newPassword += getRandomChar("abcdefghijklmnopqrstuvwxyz")
    newPassword += getRandomChar("0123456789")
    newPassword += getRandomChar("!@#$%^&*()_+~`|}{[]:;?><,./-=")

    // Fill the rest randomly
    for (let i = newPassword.length; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      newPassword += charset[randomIndex]
    }

    // Shuffle the password
    newPassword = shuffleString(newPassword)

    setPassword(newPassword)
  }

  const getRandomChar = (charset: string) => {
    const randomIndex = Math.floor(Math.random() * charset.length)
    return charset[randomIndex]
  }

  const shuffleString = (str: string) => {
    const array = str.split("")
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array.join("")
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(password)
    toast({
      title: "Fjalëkalimi u kopjua!",
      description: "Fjalëkalimi është kopjuar në clipboard.",
    })
  }

  const checkUrl = async () => {
    if (!url) return

    // Ensure URL has a protocol
    let urlToCheck = url
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      urlToCheck = "https://" + url
    }

    setUrlStatus("loading")
    setUrlDetails(null)
    setIsTestDomain(false)

    try {
      const response = await fetch("/api/check-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlToCheck }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Dështoi kontrolli i sigurisë së URL-së")
      }

      const data = await response.json()

      setUrlStatus(data.isSafe ? "safe" : "unsafe")
      setIsTestDomain(!!data.isTestDomain)
      if (data.details) {
        setUrlDetails(data.details)
      }
    } catch (error) {
      console.error("Error checking URL:", error)
      setUrlStatus("error")
      toast({
        title: "Gabim",
        description:
          error instanceof Error ? error.message : "Dështoi kontrolli i sigurisë së URL-së. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  // For testing purposes - this helps demonstrate the unsafe URL state
  const checkKnownBadUrl = () => {
    setUrl("malware.testpages.org")
    // We don't call checkUrl() automatically to respect user control
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 text-white rounded-full mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-blue-800 mb-2">SiguriX</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Mjete të thjeshta por të fuqishme për të mbrojtur privatësinë dhe sigurinë tuaj në internet.
          </p>
        </div>

        <Tabs defaultValue="password" className="max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-blue-100 rounded-lg">
            <TabsTrigger
              value="password"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
            >
              Gjenerues Fjalëkalimi
            </TabsTrigger>
            <TabsTrigger
              value="url"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
            >
              Kontrollues i Sigurisë së URL-së
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-blue-800">Dëshironi një fjalëkalim shumë të fortë?</CardTitle>
                <CardDescription>
                  Gjeneroni një fjalëkalim të sigurt dhe të rastësishëm që është i vështirë për t'u thyer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center space-x-2">
                  <Input
                    value={password}
                    readOnly
                    placeholder="Fjalëkalimi juaj i sigurt do të shfaqet këtu"
                    className="font-mono border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyPassword}
                    disabled={!password}
                    className="border-blue-300 hover:bg-blue-50"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>

                <Button onClick={generatePassword} className="w-full bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Gjenero Fjalëkalim të Fortë
                </Button>

                {password && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Forca e Fjalëkalimit</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Ky fjalëkalim përfshin shkronja të mëdha, shkronja të vogla, numra dhe karaktere speciale. Do të
                      duheshin shekuj që një kompjuter të thyente këtë fjalëkalim përmes forcës brute.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="url">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-blue-800">Dikush ju dërgoi një lidhje URL?</CardTitle>
                <CardDescription>
                  Kontrolloni nëse një lidhje është potencialisht e rrezikshme përpara se të klikoni mbi të.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center space-x-2">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Vendosni URL-në për të kontrolluar (p.sh., example.com)"
                    className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                  <Button
                    onClick={checkUrl}
                    disabled={!url || urlStatus === "loading"}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Kontrollo
                  </Button>
                </div>

                <div className="text-xs text-gray-500 flex items-center">
                  <span>Për testim:</span>
                  <Button variant="link" className="text-xs p-0 h-auto ml-1 text-blue-600" onClick={checkKnownBadUrl}>
                    Vendos një URL të njohur të rrezikshëm
                  </Button>
                </div>

                {urlStatus === "loading" && (
                  <div className="flex justify-center py-6">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                )}

                {urlStatus === "safe" && (
                  <Alert className="bg-green-50 border-green-200">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <AlertTitle className="text-green-700 text-lg">URL e Sigurt</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Kjo URL duket e sigurt sipas Google Safe Browsing API. Asnjë kërcënim nuk u zbulua.
                    </AlertDescription>
                  </Alert>
                )}

                {urlStatus === "unsafe" && (
                  <Alert className="bg-red-50 border-red-200">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                    <AlertTitle className="text-red-700 text-lg">URL Potencialisht e Rrezikshme</AlertTitle>
                    <AlertDescription className="text-red-700">
                      {isTestDomain ? (
                        <div className="flex items-start mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mr-1 mt-0.5" />
                          <span>Kjo është një URL testimi e njohur si e rrezikshme.</span>
                        </div>
                      ) : (
                        "Google Safe Browsing API ka zbuluar kërcënime në këtë URL."
                      )}

                      {urlDetails && urlDetails.length > 0 && (
                        <div className="mt-3 p-3 bg-red-100 rounded-md">
                          <p className="font-semibold">Kërcënimet e zbuluara:</p>
                          <ul className="list-disc pl-5 mt-1">
                            {urlDetails.map((threat: any, index: number) => (
                              <li key={index}>
                                {translateThreatType(threat.threatType)}
                                {threat.platformType && ` në ${translatePlatformType(threat.platformType)}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {urlStatus === "error" && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Shield className="h-5 w-5 text-yellow-600" />
                    <AlertTitle className="text-yellow-700 text-lg">Nuk Mund të Kontrollohet URL</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      Nuk mund të verifikonim sigurinë e kësaj URL. Ju lutemi vazhdoni me kujdes.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-md">
                  <p className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ky mjet përdor Google Safe Browsing API për të kontrolluar URL-të për kërcënime të njohura.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="mt-16 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} SiguriX. Të gjitha të drejtat e rezervuara.</p>
          <p className="mt-2">Krijuar nga Klerti Malaj</p>
        </footer>
      </main>
    </div>
  )
}

function translateThreatType(threatType: string): string {
  const translations: Record<string, string> = {
    MALWARE: "Malware (Program Keqdashës)",
    SOCIAL_ENGINEERING: "Inxhinieri Sociale",
    UNWANTED_SOFTWARE: "Software i Padëshiruar",
    POTENTIALLY_HARMFUL_APPLICATION: "Aplikacion Potencialisht i Dëmshëm",
  }
  return translations[threatType] || threatType
}

function translatePlatformType(platformType: string): string {
  const translations: Record<string, string> = {
    WINDOWS: "Windows",
    LINUX: "Linux",
    ANDROID: "Android",
    OSX: "Mac OS X",
    IOS: "iOS",
    ANY_PLATFORM: "Çdo Platformë",
  }
  return translations[platformType] || platformType
}
