const puppeteer = require('puppeteer');
const fs = require('fs');

async function autoCheckin() {
  console.log('🚀 开始自动签到任务...');
  
  // 从 GitHub Secrets 获取账号密码
  const username = process.env.WEBSITE_USERNAME;
  const password = process.env.WEBSITE_PASSWORD;
  
  if (!username || !password) {
    console.error('❌ 缺少账号或密码，请检查 GitHub Secrets 设置');
    fs.writeFileSync('result.txt', '错误：缺少账号或密码');
    return;
  }
  
  console.log('✅ 检测到登录信息');
  
  const browser = await puppeteer.launch({
    headless: "new", // 使用新的 headless 模式
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // 设置视口大小
    await page.setViewport({ width: 1280, height: 720 });
    
    // 设置超时时间
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);
    
    // 第一步：打开网站首页
    console.log('🌐 打开网站首页...');
    await page.goto('https://bdsm88.com', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await page.waitForTimeout(5000);
    
    // 截图首页状态
    await page.screenshot({ path: 'step1-homepage.png', fullPage: true });
    console.log('📸 首页截图已保存');
    
    // 第二步：使用更可靠的方法寻找登录入口
    console.log('🔍 寻找登录入口...');
    
    let loginClicked = false;
    
    // 方法1：通过 XPath 查找包含"登录"文本的元素
    const loginXPaths = [
      '//a[contains(text(), "登录")]',
      '//button[contains(text(), "登录")]',
      '//a[contains(@href, "login")]',
      '//a[contains(@href, "signin")]',
      '//*[contains(text(), "Sign In")]',
      '//*[contains(text(), "Sign in")]'
    ];
    
    for (const xpath of loginXPaths) {
      try {
        const elements = await page.$x(xpath);
        if (elements.length > 0) {
          await elements[0].click();
          console.log(`✅ 点击登录入口: ${xpath}`);
          loginClicked = true;
          await page.waitForTimeout(3000);
          break;
        }
      } catch (error) {
        console.log(`❌ 无法点击 ${xpath}`);
      }
    }
    
    // 如果没找到登录按钮，尝试直接访问登录页面
    if (!loginClicked) {
      console.log('⚠️ 未找到登录按钮，尝试直接访问登录页面');
      try {
        await page.goto('https://bdsm88.com/login', {
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        await page.waitForTimeout(3000);
      } catch (error) {
        console.log('❌ 无法访问登录页面，尝试其他可能路径');
        // 尝试其他可能的登录页面路径
        const loginPaths = ['/signin', '/auth', '/account', '/user/login'];
        for (const path of loginPaths) {
          try {
            await page.goto(`https://bdsm88.com${path}`, {
              waitUntil: 'networkidle2',
              timeout: 30000
            });
            console.log(`✅ 成功访问登录页面: ${path}`);
            break;
          } catch (e) {
            console.log(`❌ 无法访问 ${path}`);
          }
        }
      }
    }
    
    // 截图登录页面状态
    await page.screenshot({ path: 'step2-login-page.png', fullPage: true });
    console.log('📸 登录页面截图已保存');
    
    // 第三步：填写登录表单
    console.log('📝 尝试填写登录信息...');
    
    // 获取页面 HTML 用于调试
    const pageContent = await page.content();
    fs.writeFileSync('page-content.html', pageContent);
    console.log('💾 页面 HTML 已保存用于调试');
    
    // 尝试填写用户名
    let usernameFilled = false;
    const usernameSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[name="username"]',
      'input[name="email"]',
      'input[placeholder*="用户名"]',
      'input[placeholder*="邮箱"]',
      'input[placeholder*="user"]',
      'input[placeholder*="email"]',
      '#username',
      '#email',
      '.username',
      '.email'
    ];
    
    for (const selector of usernameSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.focus(selector);
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.type(selector, username, { delay: 50 });
        console.log(`✅ 已填写用户名到: ${selector}`);
        usernameFilled = true;
        break;
      } catch (error) {
        // 继续尝试下一个选择器
      }
    }
    
    if (!usernameFilled) {
      console.log('❌ 未找到用户名输入框，将尝试通过 XPath 查找');
      // 尝试通过 XPath 查找用户名输入框
      const usernameXPaths = [
        '//input[@type="text"]',
        '//input[@type="email"]',
        '//input[contains(@placeholder, "用户名")]',
        '//input[contains(@placeholder, "邮箱")]',
        '//input[contains(@name, "user")]',
        '//input[contains(@name, "email")]'
      ];
      
      for (const xpath of usernameXPaths) {
        try {
          const elements = await page.$x(xpath);
          if (elements.length > 0) {
            await elements[0].focus();
            await page.keyboard.down('Control');
            await page.keyboard.press('A');
            await page.keyboard.up('Control');
            await page.keyboard.type(username, { delay: 50 });
            console.log(`✅ 已填写用户名到: ${xpath}`);
            usernameFilled = true;
            break;
          }
        } catch (error) {
          // 继续尝试
        }
      }
    }
    
    await page.waitForTimeout(1000);
    
    // 尝试填写密码
    let passwordFilled = false;
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="密码"]',
      'input[placeholder*="password"]',
      '#password',
      '.password'
    ];
    
    for (const selector of passwordSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.focus(selector);
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.type(selector, password, { delay: 50 });
        console.log(`✅ 已填写密码到: ${selector}`);
        passwordFilled = true;
        break;
      } catch (error) {
        // 继续尝试下一个选择器
      }
    }
    
    if (!passwordFilled) {
      console.log('❌ 未找到密码输入框，将尝试通过 XPath 查找');
      // 尝试通过 XPath 查找密码输入框
      const passwordXPaths = [
        '//input[@type="password"]',
        '//input[contains(@placeholder, "密码")]',
        '//input[contains(@name, "password")]'
      ];
      
      for (const xpath of passwordXPaths) {
        try {
          const elements = await page.$x(xpath);
          if (elements.length > 0) {
            await elements[0].focus();
            await page.keyboard.down('Control');
            await page.keyboard.press('A');
            await page.keyboard.up('Control');
            await page.keyboard.type(password, { delay: 50 });
            console.log(`✅ 已填写密码到: ${xpath}`);
            passwordFilled = true;
            break;
          }
        } catch (error) {
          // 继续尝试
        }
      }
    }
    
    // 截图填写表单后的状态
    await page.screenshot({ path: 'step3-form-filled.png', fullPage: true });
    console.log('📸 表单填写后截图已保存');
    
    // 第四步：提交登录表单
    console.log('🔑 尝试提交登录表单...');
    
    let loginSubmitted = false;
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button[type="button"]',
      '.login-btn',
      '.submit-btn',
      '.btn-primary',
      'button'
    ];
    
    // 先尝试 CSS 选择器
    for (const selector of submitSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const text = await page.evaluate(el => el.textContent, element);
          if (text && (text.includes('登录') || text.includes('Sign In') || text.includes('Sign in') || text === '登录' || text === 'Sign In')) {
            await element.click();
            console.log(`✅ 点击提交按钮: ${selector} (文本: ${text.trim()})`);
            loginSubmitted = true;
            break;
          }
        }
        if (loginSubmitted) break;
      } catch (error) {
        // 继续尝试
      }
    }
    
    // 如果没找到，尝试 XPath
    if (!loginSubmitted) {
      const submitXPaths = [
        '//button[contains(text(), "登录")]',
        '//input[@type="submit"]',
        '//button[@type="submit"]'
      ];
      
      for (const xpath of submitXPaths) {
        try {
          const elements = await page.$x(xpath);
          if (elements.length > 0) {
            await elements[0].click();
            console.log(`✅ 点击提交按钮: ${xpath}`);
            loginSubmitted = true;
            break;
          }
        } catch (error) {
          // 继续尝试
        }
      }
    }
    
    // 如果还是没找到，尝试按回车
    if (!loginSubmitted) {
      console.log('⚠️ 未找到提交按钮，尝试按回车键');
      await page.keyboard.press('Enter');
    }
    
    // 等待登录完成
    await page.waitForTimeout(8000);
    
    // 截图登录后的状态
    await page.screenshot({ path: 'step4-after-login.png', fullPage: true });
    console.log('📸 登录后截图已保存');
    
    // 第五步：前往签到页面
    console.log('📄 前往签到页面...');
    try {
      await page.goto('https://bdsm88.com/discussion', {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      await page.waitForTimeout(5000);
      
      // 截图签到页面
      await page.screenshot({ path: 'step5-discussion-page.png', fullPage: true });
      console.log('📸 签到页面截图已保存');
    } catch (error) {
      console.log('❌ 无法访问签到页面:', error.message);
    }
    
    // 第六步：寻找签到按钮
    console.log('🔍 寻找签到按钮...');
    
    // 使用 XPath 查找签到按钮（更可靠）
    const checkinXPaths = [
      '//button[contains(text(), "签到") and not(contains(text(), "已签到"))]',
      '//button[contains(., "签到") and not(contains(., "已签到"))]',
      '//*[contains(text(), "签到") and not(contains(text(), "已签到"))]'
    ];
    
    let checkinButtonFound = false;
    let alreadySigned = false;
    
    for (const xpath of checkinXPaths) {
      const elements = await page.$x(xpath);
      if (elements.length > 0) {
        const element = elements[0];
        const isDisabled = await page.evaluate(el => el.disabled, element);
        
        if (!isDisabled) {
          await element.click();
          console.log(`✅ 找到并点击签到按钮: ${xpath}`);
          checkinButtonFound = true;
          await page.waitForTimeout(5000);
          break;
        }
      }
    }
    
    // 检查是否已经签到
    const signedXPaths = [
      '//button[contains(text(), "已签到")]',
      '//*[contains(text(), "已签到")]'
    ];
    
    for (const xpath of signedXPaths) {
      const elements = await page.$x(xpath);
      if (elements.length > 0) {
        console.log('✅ 今日已完成签到');
        alreadySigned = true;
        break;
      }
    }
    
    // 最终结果截图
    await page.screenshot({ path: 'result.png', fullPage: true });
    console.log('📸 最终结果截图已保存: result.png');
    
    // 创建结果文件
    if (checkinButtonFound) {
      fs.writeFileSync('success.txt', `签到成功！时间: ${new Date().toLocaleString()}`);
      console.log('🎉 签到成功！');
    } else if (alreadySigned) {
      fs.writeFileSync('success.txt', `今日已完成签到！时间: ${new Date().toLocaleString()}`);
      console.log('✅ 今日已完成签到');
    } else {
      fs.writeFileSync('error.txt', '未找到签到按钮，请检查页面结构');
      console.log('❌ 未找到签到按钮');
    }
    
    console.log('✅ 自动签到流程完成');
    
  } catch (error) {
    console.error('❌ 脚本执行出错:', error);
    
    // 出错时尝试截图当前页面
    try {
      await page.screenshot({ path: 'error.png', fullPage: true });
      console.log('📸 错误截图已保存: error.png');
    } catch (e) {
      console.log('无法保存错误截图:', e.message);
    }
    
    // 创建错误信息文件
    fs.writeFileSync('error.txt', `错误信息: ${error.message}\n时间: ${new Date().toLocaleString()}`);
  } finally {
    await browser.close();
    console.log('🔚 关闭浏览器');
  }
}

// 执行自动签到
autoCheckin().catch(error => {
  console.error('❌ 未捕获的错误:', error);
  fs.writeFileSync('fatal-error.txt', `致命错误: ${error.message}`);
});
