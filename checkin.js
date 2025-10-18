const puppeteer = require('puppeteer');

async function autoCheckin() {
  console.log('🚀 开始自动签到任务...');
  
  // 从 GitHub Secrets 获取账号密码
  const username = process.env.WEBSITE_USERNAME;
  const password = process.env.WEBSITE_PASSWORD;
  
  if (!username || !password) {
    console.error('❌ 缺少账号或密码，请检查 GitHub Secrets 设置');
    return;
  }
  
  console.log('✅ 检测到登录信息');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // 设置超时时间（60秒）
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);
    
    // 第一步：打开网站首页
    console.log('🌐 打开网站首页...');
    await page.goto('https://bdsm88.com', {
      waitUntil: 'networkidle2'
    });
    await page.waitForTimeout(3000);
    
    // 第二步：寻找登录入口
    console.log('🔍 寻找登录入口...');
    let loginFound = false;
    
    // 尝试多种可能的登录按钮选择器
    const loginSelectors = [
      'a[href*="login"]',
      'a[href*="signin"]',
      'button:contains("登录")',
      'button:contains("Sign in")',
      '.login-btn',
      '.signin-btn'
    ];
    
    for (const selector of loginSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        await elements[0].click();
        console.log(`✅ 点击登录入口: ${selector}`);
        loginFound = true;
        await page.waitForTimeout(3000);
        break;
      }
    }
    
    // 如果没找到登录按钮，尝试直接访问登录页面
    if (!loginFound) {
      console.log('⚠️ 未找到登录按钮，尝试直接访问登录页面');
      await page.goto('https://bdsm88.com/login', {
        waitUntil: 'networkidle2'
      });
      await page.waitForTimeout(3000);
    }
    
    // 第三步：填写登录表单
    console.log('📝 填写登录信息...');
    
    // 填写用户名
    const usernameFilled = await page.evaluate((user) => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[name*="user"], input[name*="email"]');
      for (let input of inputs) {
        input.value = user;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }, username);
    
    if (usernameFilled) {
      console.log('✅ 已填写用户名');
    } else {
      console.log('❌ 未找到用户名输入框');
    }
    
    await page.waitForTimeout(1000);
    
    // 填写密码
    const passwordFilled = await page.evaluate((pass) => {
      const inputs = document.querySelectorAll('input[type="password"]');
      for (let input of inputs) {
        input.value = pass;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }, password);
    
    if (passwordFilled) {
      console.log('✅ 已填写密码');
    } else {
      console.log('❌ 未找到密码输入框');
    }
    
    await page.waitForTimeout(1000);
    
    // 第四步：提交登录表单
    console.log('🔑 提交登录表单...');
    
    // 尝试点击登录按钮
    const loginSubmitted = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button[type="submit"], input[type="submit"], button:contains("登录"), button:contains("Sign in")');
      for (let button of buttons) {
        button.click();
        return true;
      }
      return false;
    });
    
    if (loginSubmitted) {
      console.log('✅ 已点击登录按钮');
    } else {
      // 如果没找到按钮，尝试按回车键
      await page.keyboard.press('Enter');
      console.log('✅ 按回车键提交表单');
    }
    
    // 等待登录完成
    await page.waitForTimeout(5000);
    
    // 第五步：前往签到页面
    console.log('📄 前往签到页面...');
    await page.goto('https://bdsm88.com/discussion', {
      waitUntil: 'networkidle2'
    });
    await page.waitForTimeout(5000);
    
    // 第六步：寻找并点击签到按钮
    console.log('🔍 寻找签到按钮...');
    
    const checkinResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      
      // 寻找可点击的签到按钮
      const targetButton = buttons.find(btn => {
        const text = btn.textContent || btn.innerText || '';
        return text.includes('签到') && 
               !text.includes('已签到') && 
               !btn.disabled;
      });
      
      // 检查是否已经签到
      const signedButton = buttons.find(btn => {
        const text = btn.textContent || btn.innerText || '';
        return text.includes('已签到');
      });
      
      return {
        canCheckin: !!targetButton,
        alreadySigned: !!signedButton,
        buttonText: targetButton ? (targetButton.textContent || targetButton.innerText) : '未找到按钮'
      };
    });
    
    if (checkinResult.canCheckin) {
      console.log('✅ 找到可点击的签到按钮，文本:', checkinResult.buttonText);
      
      // 点击签到按钮
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const targetButton = buttons.find(btn => {
          const text = btn.textContent || btn.innerText || '';
          return text.includes('签到') && 
                 !text.includes('已签到') && 
                 !btn.disabled;
        });
        
        if (targetButton) {
          targetButton.click();
        }
      });
      
      console.log('🎉 签到按钮点击成功！');
      await page.waitForTimeout(5000);
      
      // 验证签到结果
      const afterCheckin = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const signedButton = buttons.find(btn => {
          const text = btn.textContent || btn.innerText || '';
          return text.includes('已签到');
        });
        return !!signedButton;
      });
      
      if (afterCheckin) {
        console.log('✅ 签到成功！按钮状态已变为"已签到"');
      } else {
        console.log('⚠️ 签到操作完成，但状态未变化');
      }
      
    } else if (checkinResult.alreadySigned) {
      console.log('✅ 今日已完成签到');
    } else {
      console.log('❌ 未找到签到按钮');
    }
    
    // 保存截图供查看
    await page.screenshot({ path: 'result.png' });
    console.log('📸 截图已保存');
    
  } catch (error) {
    console.error('❌ 出错了:', error);
    // 出错时保存截图
    try {
      await page.screenshot({ path: 'error.png' });
      console.log('📸 错误截图已保存');
    } catch (e) {
      console.log('无法保存错误截图');
    }
  } finally {
    await browser.close();
    console.log('🔚 关闭浏览器');
  }
}

// 执行自动签到
autoCheckin();
