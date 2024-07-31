// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
interface User {
  id: string;
  username: string;
}

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: User;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export type {};
