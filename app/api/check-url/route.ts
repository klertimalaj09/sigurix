import { NextResponse } from "next/server"

// Known test domains that should always be flagged as unsafe
const KNOWN_UNSAFE_DOMAINS = [
  "malware.testpages.org",
  "malware.testing.google.test",
  "phishing.example.com",
  "malware.example.com",
  "ianfette.org",
  "downloadmalware.com",
]

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ message: "URL është e nevojshme" }, { status: 400 })
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch (error) {
      return NextResponse.json({ message: "Format i pavlefshëm i URL-së" }, { status: 400 })
    }

    // Extract domain for checking against known unsafe domains
    const domain = parsedUrl.hostname.toLowerCase()

    // Check if this is a known test domain that should be flagged as unsafe
    const isKnownUnsafeDomain = KNOWN_UNSAFE_DOMAINS.some(
      (unsafeDomain) => domain === unsafeDomain || domain.includes(unsafeDomain),
    )

    if (isKnownUnsafeDomain) {
      console.log("Known unsafe test domain detected:", domain)
      return NextResponse.json({
        isSafe: false,
        isTestDomain: true,
        details: [
          {
            threatType: "SOCIAL_ENGINEERING",
            platformType: "ANY_PLATFORM",
            threat: { url },
            cacheDuration: "300s",
            threatEntryType: "URL",
          },
        ],
      })
    }

    // Use Google Safe Browsing API to check URL safety
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY

    if (!apiKey) {
      return NextResponse.json({ message: "Çelësi API nuk është konfiguruar" }, { status: 500 })
    }

    try {
      console.log("Checking URL with Google Safe Browsing API:", url)

      const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client: {
            clientId: "cyber-tools-website",
            clientVersion: "1.0.0",
          },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
      })

      if (!response.ok) {
        console.error("API error:", response.status, response.statusText)
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("API response:", JSON.stringify(data))

      // Google Safe Browsing API returns matches only if threats are found
      // If no matches are returned, the URL is considered safe
      const isSafe = !data.matches || data.matches.length === 0

      return NextResponse.json({
        isSafe: isSafe,
        details: data.matches || null,
      })
    } catch (error) {
      console.error("Error calling Safe Browsing API:", error)
      return NextResponse.json(
        { message: "Gabim gjatë kontrollit të URL-së me Google Safe Browsing API" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error checking URL:", error)
    return NextResponse.json({ message: "Dështoi kontrolli i sigurisë së URL-së" }, { status: 500 })
  }
}
