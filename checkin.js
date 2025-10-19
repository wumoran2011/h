const puppeteer = require('puppeteer');
const fs = require('fs');

async function cookieCheckin() {
  console.log('🚀 开始 Cookie 签到...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // 设置 Cookie - 使用你提供的 Cookie 值
    const cookies = [
      {
        name: 'cf_clearance',
        value: '9_VQcJCU84Ed5ByxzRglI94FOpH02m7QDCefG7iUMD0-1760847792-1.2.1.1-H0yUpTBaRQwQX9q02qGQ3KUkfKmhLhM53KBp_kW792SI628.JswIG4kmqO_gBm4Uxf6snqmuPdMP._bGdMVvpmGqPDnJyzA7Y1EyJN_llHEDAANN3r.JPYq.SWj7RJjma_XHr8wBJmM6WAsJwqkKfsmWH2fanelR2rDM8HZv_K4JY_1rdNhd0Azg2uk41Lfn5mNWt10mWNnncOIj__zxaCHiVkozenida_2zr34Iove0kG_GIYMDU_D1mAyrhgZU',
        domain: '.bdsm88.com',
        path: '/',
        expires: 1797639790, // 2026-10-19T04:23:10.265Z 的时间戳
        httpOnly: true,
        secure: true
      },
      {
        name: '_ga',
        value: 'GA1.1.1790738788.1760804554',
        domain: '.bdsm88.com',
        path: '/',
        expires: 1797639790,
        httpOnly: false,
        secure: false
      },
      {
        name: '_ga_W5W91Q2PBF',
        value: 'GS2.1.s1760847750$o3$g1$t1760847989$j37$l0$h0',
        domain: '.bdsm88.com',
        path: '/',
        expires: 1797639790,
        httpOnly: false,
        secure: false
      },
      {
        name: 'cf_chl_rc_ni',
        value: '2',
        domain: 'bdsm88.com',
        path: '/',
        expires: 1739856015, // 2025-10-19T05:20:15.000Z 的时间戳
        httpOnly: false,
        secure: true
      }
    ];
    
    console.log('🍪 设置 Cookie...');
    await page.setCookie(...cookies);
    
    console.log('🌐 访问签到页面...');
    await page.goto('https://bdsm88.com/discussion', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    await page.waitForTimeout(5000);
    
    // 检查是否成功绕过 Cloudflare
    const pageTitle = await page.title();
    const currentUrl = await page.url();
    
    console.log(`📄 页面标题: ${pageTitle}`);
    console.log(`🔗 当前URL: ${currentUrl}`);
    
    // 截图记录状态
    await page.screenshot({ path: 'step1-cookie-access.png', fullPage: true });
    
    // 检查是否被重定向到验证页面
    if (pageTitle.includes('Just a moment') || currentUrl.includes('challenge')) {
      console.log('❌ Cookie 可能已过期或无效，仍然被 Cloudflare 拦截');
      fs.writeFileSync('status.txt', 'FAILED: Still blocked by Cloudflare');
      return;
    }
    
    console.log('✅ 成功绕过 Cloudflare！');
    fs.writeFileSync('status.txt', 'SUCCESS: Passed Cloudflare');
    
    // 检查是否需要登录
    if (currentUrl.includes('login') || pageTitle.toLowerCase().includes('login')) {
      console.log('🔐 需要登录，开始登录流程...');
      
      // 从环境变量获取账号密码
      const username = process.env.WEBSITE_USERNAME;
      const password = process.env.WEBSITE_PASSWORD;
      
      if (!username || !password) {
        console.log('❌ 缺少登录信息');
        fs.writeFileSync('login-status.txt', 'MISSING_CREDENTIALS');
        return;
      }
      
      // 尝试找到登录表单并填写
      console.log('📝 填写登录信息...');
      
      // 尝试多种可能的选择器
      const usernameFilled = await page.evaluate((user) => {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[name*="user"], input[name*="email"]');
        for (let input of inputs) {
          input.value = user;
          return true;
        }
        return false;
      }, username);
      
      const passwordFilled = await page.evaluate((pass) => {
        const inputs = document.querySelectorAll('input[type="password"]');
        for (let input of inputs) {
          input.value = pass;
          return true;
        }
        return false;
      }, password);
      
      if (usernameFilled && passwordFilled) {
        console.log('✅ 登录信息填写完成');
        
        // 提交登录表单
        await page.evaluate(() => {
          const buttons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
          for (let button of buttons) {
            button.click();
            return;
          }
          // 如果没找到提交按钮，尝试按回车
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        });
        
        console.log('🔑 提交登录表单...');
        await page.waitForTimeout(5000);
        
        // 检查登录是否成功
        const afterLoginUrl = await page.url();
        if (afterLoginUrl.includes('login') || afterLoginUrl.includes('error')) {
          console.log('❌ 登录失败');
          fs.writeFileSync('login-status.txt', 'LOGIN_FAILED');
          await page.screenshot({ path: 'login-failed.png', fullPage: true });
          return;
        } else {
          console.log('✅ 登录成功！');
          fs.writeFileSync('login-status.txt', 'LOGIN_SUCCESS');
        }
      } else {
        console.log('❌ 无法找到登录表单');
        fs.writeFileSync('login-status.txt', 'NO_LOGIN_FORM');
        return;
      }
    }
    
    // 登录成功后，再次访问签到页面
    console.log('📄 前往签到页面...');
    await page.goto('https://bdsm88.com/discussion', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'step2-discussion-page.png', fullPage: true });
    
    // 开始寻找签到按钮
    console.log('🔍 寻找签到按钮...');
    
    const checkinResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, input[type="button"]'));
      
      // 寻找可点击的签到按钮
      const targetButton = buttons.find(btn => {
        const text = btn.textContent || btn.innerText || btn.value || '';
        return text.includes('签到') && 
               !text.includes('已签到') && 
               !btn.disabled;
      });
      
      // 检查是否已经签到
      const signedButton = buttons.find(btn => {
        const text = btn.textContent || btn.innerText || btn.value || '';
        return text.includes('已签到');
      });
      
      return {
        canCheckin: !!targetButton,
        alreadySigned: !!signedButton,
        buttonText: targetButton ? (targetButton.textContent || targetButton.innerText || targetButton.value) : '未找到按钮',
        allButtons: buttons.map(btn => ({
          text: (btn.textContent || btn.innerText || btn.value || '').trim(),
          disabled: btn.disabled,
          id: btn.id,
          class: btn.className,
          tag: btn.tagName
        })).filter(btn => btn.text && btn.text.length < 50) // 只保留有文字且不太长的按钮
      };
    });
    
    console.log('找到的按钮:', JSON.stringify(checkinResult.allButtons, null, 2));
    
    if (checkinResult.canCheckin) {
      console.log('✅ 找到签到按钮:', checkinResult.buttonText);
      
      // 点击签到按钮
      const clickSuccess = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, input[type="button"]'));
        const targetButton = buttons.find(btn => {
          const text = btn.textContent || btn.innerText || btn.value || '';
          return text.includes('签到') && 
                 !text.includes('已签到') && 
                 !btn.disabled;
        });
        
        if (targetButton) {
          targetButton.click();
          return true;
        }
        return false;
      });
      
      if (clickSuccess) {
        console.log('🎉 签到按钮点击成功！');
        await page.waitForTimeout(3000);
        
        // 检查签到结果
        const afterCheckin = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a, input[type="button"]'));
          const signedButton = buttons.find(btn => {
            const text = btn.textContent || btn.innerText || btn.value || '';
            return text.includes('已签到');
          });
          return !!signedButton;
        });
        
        if (afterCheckin) {
          console.log('✅ 签到成功！');
          fs.writeFileSync('checkin-result.txt', 'SUCCESS: Checkin completed');
        } else {
          console.log('⚠️ 签到操作完成，但状态未确认');
          fs.writeFileSync('checkin-result.txt', 'UNKNOWN: Checkin action performed');
        }
        
      } else {
        console.log('❌ 无法点击签到按钮');
        fs.writeFileSync('checkin-result.txt', 'CLICK_FAILED: Cannot click button');
      }
      
    } else if (checkinResult.alreadySigned) {
      console.log('✅ 今日已完成签到');
      fs.writeFileSync('checkin-result.txt', 'ALREADY_SIGNED: Already checked in today');
    } else {
      console.log('❌ 未找到签到按钮');
      fs.writeFileSync('checkin-result.txt', 'NO_BUTTON: Checkin button not found');
      
      // 保存页面 HTML 用于调试
      const pageHtml = await page.content();
      fs.writeFileSync('debug-page.html', pageHtml);
    }
    
    // 最终结果截图
    await page.screenshot({ path: 'final-result.png', fullPage: true });
    console.log('✅ 流程完成');
    
  } catch (error) {
    console.error('❌ 出错:', error);
    fs.writeFileSync('error.txt', `ERROR: ${error.message}`);
    
    // 出错时截图
    try {
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    } catch (e) {
      console.log('无法保存错误截图');
    }
  } finally {
    await browser.close();
    console.log('🔚 浏览器关闭');
  }
}

cookieCheckin();
