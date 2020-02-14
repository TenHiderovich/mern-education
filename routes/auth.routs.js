const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

const router = Router();

const middlewareRegisterValidate = [
    check('email', 'Некорректыный email').isEmail(),
    check('password', 'Минимальная длинна пароля 6 символов').isLength({ min: 6 })
];

router.post('/register', middlewareRegisterValidate, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Не корректные данные при регистрации'
            })
        }

        const { email, password } = req.body;
        const candidate = await User.findOne({ email });
        if (candidate) {
            return res.status(400).json({ message: 'Такой пользователь уже существует' });
        }

        const hashPassword = await bcrypt.hash(password, 12);
        const user = new User({ email, password: hashPassword });

        await user.save();

        res.status(201).json({ message: 'Пользователь создан' });
        
    } catch (e) {
        res.status(500).json({ message: 'Что то пошло не так, попробуйте снова..' })
    }
});

const middlewareLoginValidate = [
    check('email', 'Некорректыный email').normalizeEmail().isEmail(),
    check('password', 'Введите пароль').exists()
];

router.post('/login', middlewareLoginValidate, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Не корректные данные при входе'
            })
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }
        
        const isMatch = bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Не корректные данные' });
        }

        const token = jwt.sign(
            { userId: user.id },
            config.get('jwtSecret'),
            { expiresIn: '1h' }
        );

        res.json({ token, userId: user.id });
        
    } catch (e) {
        res.status(500).json({ message: 'Что то пошло не так, попробуйте снова..' })
    }
});


module.exports = router;