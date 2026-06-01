const { cloudinary, isConfigured } = require('../config/cloudinary');

async function run() {
  if (!isConfigured) {
    console.error('\n❌ Cloudinary 미설정');
    console.error('backend/.env 파일에 아래 중 하나를 추가하세요:\n');
    console.error('  방법 1) CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    console.error('  방법 2) CLOUDINARY_URL=cloudinary://...\n');
    console.error('값은 https://console.cloudinary.com → Dashboard 에서 확인\n');
    process.exit(1);
  }

  try {
    const result = await cloudinary.api.ping();
    console.log('\n✅ Cloudinary 연결 성공!');
    console.log('   status:', result.status);
    console.log('   cloud:', cloudinary.config().cloud_name);
    console.log('\n업로드 폴더: mypetlog/posts, mypetlog/profiles\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Cloudinary 연결 실패:', err.message);
    console.error('API Key / Secret / Cloud Name 을 다시 확인해주세요.\n');
    process.exit(1);
  }
}

run();
