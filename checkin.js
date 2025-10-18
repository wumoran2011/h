const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

// 使用 stealth 插件避免被检测
puppeteer.use(StealthPlugin());

async function autoCheckin() {
  console.log('🚀 开始自动签到任务（使用反检测模式）...');
  
  const username = process.env.WEBSITE_USERNAME;
  const password = process.env.WEBSITE_PASSWORD;
  
  if (!username || !password) {
    console.error('❌ 缺少账号或密码');
    fs.writeFileSync('result.txt', '错误：缺少账号或密码');
    return;
  }
  
  console.log('✅ 检测到登录信息');
  
  const browser = await puppeteer.launch({
    headless: false, // 改为非无头模式，更容易通过检测
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // 隐藏自动化特征
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });
    
    await page.setViewport({ width: 1366, height: 768 });
    await page.setDefaultNavigationTimeout(120000);
    await page.setDefaultTimeout(120000);
    
    console.log('🌐 尝试访问网站（等待 Cloudflare 验证）...');
    
    // 访问网站并等待更长时间
    await page.goto('https://bdsm88.com', {
      waitUntil: 'networkidle2',
      timeout: 120000
    });
    
    await page.waitForTimeout(10000); // 等待10秒
    
    // 检查当前页面是否是 Cloudflare 验证页面
    const isCloudflare = await page.evaluate(() => {
      return document.title.includes('Just a moment') || 
             document.body.textContent.includes('Cloudflare') ||
             document.body.textContent.includes('Verify you are human');
    });
    
    if (isCloudflare) {
      console.log('🛡️ 检测到 Cloudflare 防护，等待自动验证...');
      
      // 等待可能的自动验证完成
      await page.waitForTimeout(15000);
      
      // 再次检查是否还在验证页面
      const stillCloudflare = await page.evaluate(() => {
        return document.title.includes('Just a moment') || 
               document.body.textContent.includes('Verify you are human');
      });
      
      if (stillCloudflare) {
        console.log('❌ Cloudflare 验证未通过，需要手动干预');
        await page.screenshot({ path: 'cloudflare-blocked.png', fullPage: true });
        
        // 尝试其他方法绕过
        console.log('🔄 尝试刷新页面...');
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForTimeout(10000);
      }
    }
    
    // 截图当前状态
    await page.screenshot({ path: 'after-cloudflare.png', fullPage: true });
    
    // 检查是否成功绕过 Cloudflare
    const currentUrl = page.url();
    const pageTitle = await page.title();
    
    console.log(`📄 当前页面: ${pageTitle}`);
    console.log(`🔗 当前URL: ${currentUrl}`);
    
    if (currentUrl.includes('bdsm88.com') && !pageTitle.includes('Just a moment')) {
      console.log('✅ 成功绕过 Cloudflare 防护！');
      
      // 继续执行签到流程
      console.log('🔍 寻找登录入口...');
      
      // 这里继续之前的登录和签到逻辑
      // ... [之前的登录代码]
      
    } else {
      console.log('❌ 无法绕过 Cloudflare 防护');
      fs.writeFileSync('cloudflare-failed.txt', 'Cloudflare 防护无法自动绕过');
    }
    
    await page.screenshot({ path: 'final-result.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ 脚本执行出错:', error);
    fs.writeFileSync('error.txt', `错误: ${error.message}`);
  } finally {
    await browser.close();
    console.log('🔚 关闭浏览器');
  }
}

autoCheckin().catch(console.error);
