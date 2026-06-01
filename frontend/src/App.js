import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import FindEmail from './pages/auth/FindEmail';
import FindPassword from './pages/auth/FindPassword';
import MyPage from './pages/mypage/MyPage';
import EditNickname from './pages/mypage/EditNickname';
import EditProfilePhoto from './pages/mypage/EditProfilePhoto';
import EditPassword from './pages/mypage/EditPassword';
import EditSecurity from './pages/mypage/EditSecurity';
import DeleteAccount from './pages/mypage/DeleteAccount';
import BoardList from './pages/board/BoardList';
import PostDetail from './pages/board/PostDetail';
import PostCreate from './pages/board/PostCreate';
import PostEdit from './pages/board/PostEdit';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/board' element={<BoardList />} />
            <Route path='/board/write' element={<PostCreate />} />
            <Route path='/board/:postId' element={<PostDetail />} />
            <Route path='/board/:postId/edit' element={<PostEdit />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/find-email' element={<FindEmail />} />
            <Route path='/find-password' element={<FindPassword />} />
            <Route path='/mypage' element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
            <Route path='/mypage/edit-nickname' element={<EditNickname />} />
            <Route path='/mypage/edit-profile-photo' element={<EditProfilePhoto />} />
            <Route path='/mypage/edit-password' element={<EditPassword />} />
            <Route path='/mypage/edit-security' element={<EditSecurity />} />
            <Route path='/mypage/delete-account' element={<DeleteAccount />} />
            <Route path='*' element={<Navigate to='/board' />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
