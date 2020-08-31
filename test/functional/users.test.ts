import user from '@src/models/user';
import AuthService from '@src/services/auth';
import httpStatusCodes from 'http-status-codes';

describe('User functional tests', () => {
  beforeEach(async () => await user.deleteMany({}));
  describe('When creating an new user', () => {
    it('should succesfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com.br',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(201);
      await expect(
        AuthService.comparePasswords(newUser.password, response.body.password)
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({ ...newUser, password: expect.any(String) })
      );
    });

    it('should return status code 400 when there is validation error', async () => {
      const newUser = {
        email: 'john@mail.com.br',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: httpStatusCodes.getStatusText(422),
        message: 'User validation failed: name: Path `name` is required.',
      });
    });

    it('should return status code 409 when the email already exists', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com.br',
        password: '1234',
      };

      await global.testRequest.post('/users').send(newUser);
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: httpStatusCodes.getStatusText(409),
        message:
          'User validation failed: email: already exists in the database',
      });
    });
  });
  describe('When authenticate an user', () => {
    it('should generate a token for valid user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      await new user(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });

      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });
    it('should return UNAUTHORIZED status if user the given email not found', async () => {
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: 'not-found@email.com.br', password: '1234' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: 401,
        error: httpStatusCodes.getStatusText(401),
        message: 'User not found',
      });
    });
    it('should return UNAUTHORIZED status if password does not match', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      await new user(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: 'no-correct-password' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: 401,
        error: httpStatusCodes.getStatusText(401),
        message: 'Invalid credentials',
      });
    });
  });
  describe('When getting user profile info', () => {
    it('should return the logged user profit informations', async () => {
      const newUser = {
        name: 'John doe',
        email: 'john@email.com',
        password: '1234',
      };
      const User = await new user(newUser).save();
      const token = await AuthService.generateToken(User.toJSON());
      const { body, status } = await global.testRequest.get('/users/me').set({
        'x-access-token': token,
      });

      expect(status).toBe(200);
      expect(body).toMatchObject(JSON.parse(JSON.stringify({ user: User })));
    });

    it('should return not found when the user not found', async () => {
      const newUser = {
        name: 'John doe',
        email: 'john@email.com',
        password: '1234',
      };

      // Cria o usuário, mas não salva...
      const User = await new user(newUser);
      const token = await AuthService.generateToken(User.toJSON());
      const { body, status } = await global.testRequest.get('/users/me').set({
        'x-access-token': token,
      });

      expect(status).toBe(404);
      expect(body.message).toBe('User not found');
    });
  });
});
