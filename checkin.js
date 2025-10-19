const puppeteer = require('puppeteer');
const fs = require('fs');

async function testMethods() {
  console.log('🧪 测试不同的绕过方法...');
  
  const testCases = [
    {
      name: '桌面Chrome',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 }
    },
    {
      name: '移动端Safari', 
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      viewport: { width: 375, height: 812 }
    },
    {
      name: 'Firefox',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
      viewport: { width: 1366, height: 768 }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🔧 测试: ${testCase.name}`);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(testCase.userAgent);
      await page.setViewport(testCase.viewport);
      
      await page.goto('https://bdsm88.com', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await page.waitForTimeout(5000);
      
      const title = await page.title();
      const url = await page.url();
      
      console.log(`  标题: ${title}`);
      console.log(`  URL: ${url}`);
      
      const result = title.includes('Just a moment') ? 'BLOCKED' : 'SUCCESS';
      console.log(`  结果: ${result}`);
      
      fs.writeFileSync(`test-${testCase.name}.txt`, `标题: ${title}\nURL: ${url}\n结果: ${result}`);
      
    } catch (error) {
      console.log(`  错误: ${error.message}`);
      fs.writeFileSync(`test-${testCase.name}.txt`, `错误: ${error.message}`);
    } finally {
      await browser.close();
    }
  }
}

testMethods();
