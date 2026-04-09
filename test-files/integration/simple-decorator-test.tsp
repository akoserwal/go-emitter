interface SimpleService {
  @get
  getItem(@path id: int64): string;

  @post
  createItem(@body data: string): string;
}