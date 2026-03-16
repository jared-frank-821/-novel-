// 测试API连接
const testApiConnection = async () => {
  console.log('正在测试API连接...');
  
  try {
    const response = await fetch('http://localhost:3001/api/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: '测试连接' }),
    });

    console.log('响应状态:', response.status);
    console.log('响应状态文本:', response.statusText);

    if (response.ok) {
      const text = await response.text();
      console.log('✅ API连接成功！');
      console.log('响应内容:', text.substring(0, 200) + '...');
    } else {
      console.log('❌ API连接失败');
      try {
        const errorData = await response.json();
        console.log('错误详情:', errorData);
      } catch (e) {
        const errorText = await response.text();
        console.log('错误响应:', errorText);
      }
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
    console.log('完整错误:', error);
  }
};

// 运行测试
testApiConnection();