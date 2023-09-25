import jwt from "jsonwebtoken"

function authenticateToken(req, res, next) {
    const token = req.cookies.jwtToken; // クッキーからトークンを取得
  
    if (!token) {
      return res.status(401).send('Unauthorized'); // トークンがない場合は認証エラー
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send('Forbidden'); // トークンが無効な場合はアクセス拒否
      }
      req.user = user; // デコードされたユーザー情報をリクエストオブジェクトに追加
      next();
    });
  }

  export default authenticateToken;
  