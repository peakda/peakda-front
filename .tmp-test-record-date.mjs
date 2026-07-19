import { chromium } from 'playwright'

const shotDir = 'C:/Users/USER/AppData/Local/Programs/MICROS~1/claude/c--Users-USER-Desktop-Peakda/d0b84728-9a88-40d9-ab51-9b9aa4b4f4dd/scratchpad'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 430, height: 932 } })
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text())
})
page.on('pageerror', (err) => console.log('PAGE ERROR:', err))

await page.goto('http://localhost:3000/record', { waitUntil: 'networkidle' })
await page.waitForSelector('text=촬영일자', { timeout: 15000 })
await page.screenshot({ path: `${shotDir}/1-record-page.png` })

// open date select drawer
await page.locator('text=날짜를 입력해주세요 (yyyy.mm.dd)').click()
await page.waitForSelector('text=촬영 일자 선택', { timeout: 5000 })
await page.waitForTimeout(700)
await page.screenshot({ path: `${shotDir}/2-date-drawer-calendar.png` })

// pick a day
await page.locator('button:text-is("15")').first().click()
await page.waitForTimeout(200)
await page.screenshot({ path: `${shotDir}/2b-date-drawer-day-selected.png` })

// click year-month header to open year-month picker
await page.locator('button:has-text("월")').first().click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${shotDir}/3-date-drawer-year-month.png` })

// pick a different month
await page.locator('button:has-text("2027년")').first().click()
await page.waitForTimeout(200)
await page.screenshot({ path: `${shotDir}/4-date-drawer-year-month-picked.png` })

// confirm year-month
await page.locator('button:text-is("선택")').click()
await page.waitForTimeout(300)
await page.screenshot({ path: `${shotDir}/5-date-drawer-back-to-calendar.png` })

await browser.close()
console.log('done')
