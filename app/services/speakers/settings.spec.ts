import { disconnectDB, resetDB } from '../../../tests/db-helpers';
import { UserFactory } from '../../../tests/factories/users';
import { db } from '../db';
import { UserNotFoundError } from '../errors';
import { getSettings, updateSettings, validateProfileData } from './settings.server';

describe('#getSettings', () => {
  beforeEach(() => resetDB());
  afterAll(() => disconnectDB());

  it('should return the default response', async () => {
    const user = await UserFactory.create();

    const response = await getSettings(user.id);
    expect(response).toEqual({
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      bio: user.bio,
      references: user.references,
      company: user.company,
      address: user.address,
      twitter: user.twitter,
      github: user.github,
    });
  });

  it('should throw an error when user not found', async () => {
    await expect(getSettings('XXX')).rejects.toThrowError(UserNotFoundError);
  });
});

describe('#updateSettings', () => {
  beforeEach(() => resetDB());
  afterAll(() => disconnectDB());

  it('should update personal information', async () => {
    const user = await UserFactory.create();

    const data = {
      name: 'John Doe',
      email: 'john.doe@email.com',
      photoURL: 'https://example.com/photo.jpg',
    };

    await updateSettings(user.id, data);

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.name).toEqual(data.name);
    expect(updated?.email).toEqual(data.email);
    expect(updated?.photoURL).toEqual(data.photoURL);
  });

  it('should update user details', async () => {
    const user = await UserFactory.create();

    const data = {
      bio: 'lorem ipsum',
      references: 'impedit quidem quisquam',
    };

    await updateSettings(user.id, data);

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.bio).toEqual(data.bio);
    expect(updated?.references).toEqual(data.references);
  });

  it('should update user details', async () => {
    const user = await UserFactory.create();

    const data = {
      company: 'company',
      address: 'address',
      twitter: 'twitter',
      github: 'github',
    };

    await updateSettings(user.id, data);

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.company).toEqual(data.company);
    expect(updated?.address).toEqual(data.address);
    expect(updated?.twitter).toEqual(data.twitter);
    expect(updated?.github).toEqual(data.github);
  });

  it('should throw an error when user not found', async () => {
    const data = { bio: '', references: '' };
    await expect(updateSettings('XXX', data)).rejects.toThrowError(UserNotFoundError);
  });
});

describe('#validateProfileData', () => {
  it('should validate personal information', () => {
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'john.doe@email.com');
    formData.append('photoURL', 'https://example.com/photo.jpg');

    const result = validateProfileData(formData, 'INFO');
    expect(result.success && result.data).toEqual({
      name: 'John Doe',
      email: 'john.doe@email.com',
      photoURL: 'https://example.com/photo.jpg',
    });
  });

  it('should validate user details', () => {
    const formData = new FormData();
    formData.append('bio', 'lorem ipsum');
    formData.append('references', 'impedit quidem quisquam');

    const result = validateProfileData(formData, 'DETAILS');
    expect(result.success && result.data).toEqual({
      bio: 'lorem ipsum',
      references: 'impedit quidem quisquam',
    });
  });

  it('should validate additional indormation', () => {
    const formData = new FormData();
    formData.append('company', 'company');
    formData.append('address', 'address');
    formData.append('twitter', 'twitter');
    formData.append('github', 'github');

    const result = validateProfileData(formData, 'ADDITIONAL');
    expect(result.success && result.data).toEqual({
      company: 'company',
      address: 'address',
      twitter: 'twitter',
      github: 'github',
    });
  });

  it('should validate mandatory and format for personal information', () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('email', '');
    formData.append('photoURL', '');

    const result = validateProfileData(formData, 'INFO');
    expect(!result.success && result.error.errors.map((e) => e.code)).toEqual([
      'too_small',
      'invalid_string',
      'too_small',
      'invalid_string',
      'too_small',
    ]);
  });
});
