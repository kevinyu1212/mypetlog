export default function LoadingSpinner({ text = '로딩 중...' }) {
  return (
    <div className='flex flex-col items-center justify-center py-20'>
      <div className='w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3' />
      <p className='text-gray-400 text-sm'>{text}</p>
    </div>
  );
}
