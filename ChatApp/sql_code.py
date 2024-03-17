# import sqlite3


# class Sql_codes():
#     @staticmethod
#     def insert_data(query, values, table):
#         try:
#             conn = sqlite3.connect(table)
#             c = conn.cursor()
#             c.execute(query, values)
#             conn.commit()
#         except sqlite3.Error as e:
#             print("An error occurred:", e.args[0])
#         finally:
#             conn.close()

#     @staticmethod
#     def select_data(query, table):
#         try:
#             conn = sqlite3.connect(table)
#             c = conn.cursor()
#             c.execute(query)
#             result = c.fetchall()
#             return result
#         except sqlite3.Error as e:
#             print("An error occurred:", e.args[0])
#         finally:
#             conn.close()
        
#     @staticmethod
#     def delete_record(query, table):
#         try:
#             conn = sqlite3.connect(table)
#             c = conn.cursor()
#             c.execute(query)
#             conn.commit()  # Commit the changes to the database
#             print("Record(s) deleted successfully.")
#         except sqlite3.Error as e:
#             print("An error occurred:", e.args[0])
#         finally:
#             conn.close()
# # room_details = Sql_codes.select_data(f"select * from Game_room_details where room = 'room_123'",'db.sqlite3')
# # print(room_details)