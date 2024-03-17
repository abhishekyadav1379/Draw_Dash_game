class Store_rooms:
    def __init__(self, room, game_start, rounds, active_user):
        self.room = room
        self.game_start = False
        self.rounds = 2
        self.cur_round = 0
        self.active_user = active_user
        self.all_users = []
        self.cur_word = ""
        self.counter = 0
        self.drawing_started = 0
        self.round_time = 30
        self.current_time = 30
        self.users_score = {}
        self.disconnected_users = {}
        self.waiting_users = []
        self.who_guessed = {}
        self.coordinates = []
        self.canvas_width = 600
        self.canvas_height = 400
        self.draw_pattern = []
        self.game_owner = ""
        self.no_of_words = 3
    # def __init__(self, room, game_start, rounds, active_user, all_users, cur_word, counter, drawing_started, round_time, current_time):
    #     self.room = room
    #     self.game_start = game_start
    #     self.rounds = rounds
    #     self.active_user = active_user
    #     self.all_users = all_users
    #     self.cur_word = cur_word
    #     self.counter = counter
    #     self.drawing_started = drawing_started
    #     self.round_time = round_time
    #     self.current_time = current_time
        
active_rooms = {
}

exist_rooms = set()