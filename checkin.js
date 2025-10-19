const puppeteer = require('puppeteer');
const fs = require('fs');

async function testPuppeteer() {
  console.log('🧪 测试 Puppeteer 是否正常工作...');
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('✅ Puppeteer 启动成功');
    
    const page = await browser.newPage();
    console.log('✅ 页面创建成功');
    
    // 测试访问一个简单网站
    await page.goto('https://www.example.com', { timeout: 30000 });
    console.log('✅ 网站访问成功');
    
    const title = await page.title();
    console.log(`📄 页面标题: ${title}`);
    
    await page.screenshot({ path: 'test-success.png' });
    console.log('📸 截图成功');
    
    await browser.close();
    console.log('🔚 浏览器关闭成功');
    
    fs.writeFileSync('test-result.txt', 'SUCCESS: Puppeteer is working correctly');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    fs.writeFileSync('test-error.txt', `ERROR: ${error.message}`);
  }
}

testPuppeteer();
