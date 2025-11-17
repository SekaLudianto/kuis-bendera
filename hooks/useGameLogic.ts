
import { useReducer, useCallback, useEffect, useRef } from 'react';
import { Country, ChatMessage, LeaderboardEntry, RoundWinner } from '../types';
import { countries } from '../data/countries';
import { TOTAL_ROUNDS, ROUND_TIMER_SECONDS, MAX_WINNERS_PER_ROUND, BASE_POINTS, SPEED_BONUS_MULTIPLIER, WINNER_MODAL_TIMEOUT_MS } from '../constants';

interface GameState {
  round: number;
  currentCountry: Country | null;
  scrambledCountryName: string[];
  chatMessages: ChatMessage[];
  leaderboard: LeaderboardEntry[];
  roundWinners: RoundWinner[];
  isRoundActive: boolean;
  roundTimer: number;
  isGameOver: boolean;
  showWinnerModal: boolean;
}

type GameAction =
  | { type: 'START_GAME'; payload: Country[] }
  | { type: 'NEXT_ROUND'; payload: Country }
  | { type: 'PROCESS_COMMENT'; payload: ChatMessage }
  | { type: 'END_ROUND' }
  | { type: 'TICK_TIMER' }
  | { type: 'SHOW_WINNER_MODAL' }
  | { type: 'HIDE_WINNER_MODAL' }
  | { type: 'RESET_GAME' };

const initialState: GameState = {
  round: 0,
  currentCountry: null,
  scrambledCountryName: [],
  chatMessages: [],
  leaderboard: JSON.parse(localStorage.getItem('leaderboard') || '[]'),
  roundWinners: [],
  isRoundActive: false,
  roundTimer: ROUND_TIMER_SECONDS,
  isGameOver: false,
  showWinnerModal: false,
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const scrambleWord = (word: string): string[] => {
  const originalLetters = word.toUpperCase().replace(/[^A-Z\s]/g, '').split('');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const extraLettersCount = Math.floor(originalLetters.filter(c => c !== ' ').length / 3) + 3;
  
  const extraLetters = [];
  for (let i = 0; i < extraLettersCount; i++) {
    extraLetters.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
  }

  const combinedLetters = [...originalLetters.filter(c => c !== ' '), ...extraLetters];
  
  return shuffleArray(combinedLetters);
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME': {
      const firstCountry = action.payload[0];
      return {
        ...state,
        round: 1,
        currentCountry: firstCountry,
        scrambledCountryName: scrambleWord(firstCountry.name),
        isRoundActive: true,
        roundWinners: [],
        roundTimer: ROUND_TIMER_SECONDS,
        showWinnerModal: false,
        isGameOver: false,
      };
    }
    case 'NEXT_ROUND': {
      if (state.round >= TOTAL_ROUNDS) {
        return { ...state, isGameOver: true, isRoundActive: false };
      }
      const newRound = state.round + 1;
      const newCountry = action.payload;
      return {
        ...state,
        round: newRound,
        currentCountry: newCountry,
        scrambledCountryName: scrambleWord(newCountry.name),
        isRoundActive: true,
        roundWinners: [],
        roundTimer: ROUND_TIMER_SECONDS,
        showWinnerModal: false,
      };
    }
    case 'PROCESS_COMMENT': {
      const message = action.payload;
      let newChatMessages = [message, ...state.chatMessages];
      if (newChatMessages.length > 50) newChatMessages = newChatMessages.slice(0, 50);

      if (
        !state.isRoundActive ||
        !state.currentCountry ||
        state.roundWinners.length >= MAX_WINNERS_PER_ROUND ||
        state.roundWinners.some(w => w.nickname === message.nickname)
      ) {
        return { ...state, chatMessages: newChatMessages };
      }

      if (message.comment.trim().toLowerCase().startsWith(state.currentCountry.name.toLowerCase())) {
        const timeTaken = ROUND_TIMER_SECONDS - state.roundTimer;
        const score = BASE_POINTS + Math.max(0, (ROUND_TIMER_SECONDS - timeTaken) * SPEED_BONUS_MULTIPLIER);

        const newWinner: RoundWinner = {
          nickname: message.nickname,
          score,
          profilePictureUrl: message.profilePictureUrl,
          time: timeTaken,
        };
        
        const updatedLeaderboard = [...state.leaderboard];
        const playerIndex = updatedLeaderboard.findIndex(p => p.nickname === message.nickname);
        if (playerIndex > -1) {
          updatedLeaderboard[playerIndex].score += score;
        } else {
          updatedLeaderboard.push({ nickname: message.nickname, score, profilePictureUrl: message.profilePictureUrl });
        }
        updatedLeaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));

        return {
          ...state,
          chatMessages: [{...message, isWinner: true}, ...state.chatMessages.slice(0,49)],
          roundWinners: [...state.roundWinners, newWinner],
          leaderboard: updatedLeaderboard,
        };
      }

      return { ...state, chatMessages: newChatMessages };
    }
    case 'TICK_TIMER': {
        if (!state.isRoundActive) return state;
        if (state.roundTimer > 0) {
            return { ...state, roundTimer: state.roundTimer - 1 };
        }
        return state;
    }
    case 'END_ROUND':
        return { ...state, isRoundActive: false };
    case 'SHOW_WINNER_MODAL':
        return { ...state, showWinnerModal: true };
    case 'HIDE_WINNER_MODAL':
        return { ...state, showWinnerModal: false };
    case 'RESET_GAME':
      return { ...initialState, leaderboard: JSON.parse(localStorage.getItem('leaderboard') || '[]') };
    default:
      return state;
  }
};

export const useGameLogic = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const countryDeck = useRef<Country[]>([]);

  const prepareNewDeck = useCallback(() => {
    countryDeck.current = shuffleArray(countries);
  }, []);

  const getNextCountry = useCallback(() => {
    if (countryDeck.current.length === 0) {
      prepareNewDeck();
    }
    return countryDeck.current.pop() as Country;
  }, [prepareNewDeck]);

  const startGame = useCallback(() => {
    prepareNewDeck();
    const firstCountries = Array.from({ length: TOTAL_ROUNDS }, getNextCountry);
    countryDeck.current = firstCountries; // Use this deck for the session
    dispatch({ type: 'START_GAME', payload: firstCountries });
  }, [prepareNewDeck, getNextCountry]);
  
  const nextRound = useCallback(() => {
    const nextCountry = getNextCountry();
    dispatch({ type: 'NEXT_ROUND', payload: nextCountry });
  }, [getNextCountry]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    prepareNewDeck();
  }, [prepareNewDeck]);
  
  const processComment = useCallback((message: ChatMessage) => dispatch({ type: 'PROCESS_COMMENT', payload: message }), []);

  useEffect(() => {
    prepareNewDeck();
  }, [prepareNewDeck]);

  // Starts timer as soon as round is active
  useEffect(() => {
    let timerId: number;
    if (state.isRoundActive) {
      timerId = window.setInterval(() => {
        dispatch({ type: 'TICK_TIMER' });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [state.isRoundActive]);
  
  // Ends round when timer hits 0 or max winners is reached
  useEffect(() => {
      if (state.isRoundActive && (state.roundTimer <= 0 || state.roundWinners.length >= MAX_WINNERS_PER_ROUND)) {
          dispatch({ type: 'END_ROUND' });
      }
  }, [state.roundTimer, state.roundWinners.length, state.isRoundActive]);

  // Shows winner modal when a round ends
  useEffect(() => {
      if (!state.isRoundActive && state.round > 0 && !state.isGameOver) {
          dispatch({ type: 'SHOW_WINNER_MODAL' });
      }
  }, [state.isRoundActive, state.round, state.isGameOver]);

  // Hides modal and proceeds to next round after a delay
  useEffect(() => {
      if (state.showWinnerModal) {
          const timeoutId = setTimeout(() => {
              dispatch({ type: 'HIDE_WINNER_MODAL' });
              if (!state.isGameOver) {
                  nextRound();
              }
          }, WINNER_MODAL_TIMEOUT_MS);
          return () => clearTimeout(timeoutId);
      }
  }, [state.showWinnerModal, state.isGameOver, nextRound]);


  return { state, startGame, resetGame, processComment };
};
