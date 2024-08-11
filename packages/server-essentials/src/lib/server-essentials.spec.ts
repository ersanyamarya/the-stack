import { serverEssentials } from './server-essentials';

describe('serverEssentials', () => {
  it('should work', () => {
    expect(serverEssentials()).toEqual('server-essentials');
  });
});
