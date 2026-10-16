import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type CollectionStackParamList = {
  Collections: undefined;
  CollectionDetail: { collectionId: string };
  VocabularyList: { collectionId: string };
  VocabularyDetail: { vocabularyId: string; collectionId?: string };
  VocabularyEdit: { vocabularyId?: string; collectionId?: string };
  ReviewSettings: { collectionId: string };
  AddVocabulary: { collectionId: string };
  DictionarySearch: { collectionId?: string };
  AiNormalize: { collectionId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Collections: NavigatorScreenParams<CollectionStackParamList>;
  Practice: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
