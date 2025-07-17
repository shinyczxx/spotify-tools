// Debug test for theme color issue
import { test, expect, Page } from '@playwright/test'

async function debugSetupPage(page: Page, themeColor: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Debug Test</title>
      <style>
        :root {
          --terminal-cyan: ${themeColor};
        }
      </style>
    </head>
    <body>
      <div>Test content</div>
      <script>
        console.log('Theme color:', ${JSON.stringify(themeColor)});
        document.body.setAttribute('data-test-theme-color', ${JSON.stringify(themeColor)});
        console.log('Set attribute to:', document.body.getAttribute('data-test-theme-color'));
      </script>
    </body>
    </html>
  `

  await page.setContent(html)
}

test('Debug theme color attribute', async ({ page }) => {
  await debugSetupPage(page, '#00FFFF')

  // Check console logs
  const messages: string[] = []
  page.on('console', (msg) => {
    messages.push(msg.text())
  })

  await page.waitForTimeout(1000)

  const bodyThemeColor = await page.getAttribute('body', 'data-test-theme-color')
  console.log('Messages:', messages)
  console.log('bodyThemeColor:', bodyThemeColor)

  expect(bodyThemeColor).toBe('#00FFFF')
})
