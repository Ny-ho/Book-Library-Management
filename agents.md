remember this is not a huge scale webapp, it is just for the interviewer.
Preference: DONOT EDIT or change files and codes by yourself unluess i specifically ask you to.However you(ai) have permission to view and read the files and codes anytime without the need to ask me for permission.
if code is huge,divide the code into parts and explain line by line . 

# Milestone 2: Core Library Database API (SQLite & SQLModel)
This document contains the complete step-by-step code and detailed line-by-line explanations for building your core Library System using **FastAPI** and **SQLModel**.

Use this as your blueprint. Copy the code into the corresponding files in your project, and read the explanation below each block to understand exactly **why** we wrote it and **how** it connects to the rest of the app.
---
## 📁 Project Directory Structure
Ensure your files are placed in these exact locations:
```text
library_api/
│
├── app/
│   ├── __init__.py
│   ├── main.py                  # Server initialization & lifespans
│   ├── config.py                # Environment variables configuration
│   ├── database.py              # SQLite engine & database sessions
│   │
│   └── books/
│       ├── __init__.py
│       ├── models.py            # SQLModel Database Table
│       ├── schemas.py           # Pydantic validation schemas
│       ├── service.py           # Database CRUD logic functions
│       └── router.py            # API request endpoints
│
├── .env                         # Local secrets & settings
└── requirements.txt             # Installed dependencies
```

---

## 1. Setup & Environment Configurations

### 📄 `requirements.txt`
Add the following libraries to your dependencies list:
```text
fastapi
uvicorn
sqlmodel
pydantic-settings
```

#### 🔍 Line-by-Line Explanation:
*   `fastapi`: The web framework we use to write our API endpoints, handle HTTP requests, and auto-generate Swagger UI.
*   `uvicorn`: The lightning-fast ASGI web server that runs our FastAPI application.
*   `sqlmodel`: A wrapper library that combines **SQLAlchemy** (for database interaction) and **Pydantic** (for data validation). This ensures we write clean, pythonic code that works with both worlds.
*   `pydantic-settings`: A helper library to load environment variables from a `.env` file into our Python application securely and with type safety.

---

### 📄 `.env`
Add your local database connection string here:
```env
DATABASE_URL=sqlite:///./library.db
```

#### 🔍 Line-by-Line Explanation:
*   `DATABASE_URL=sqlite:///./library.db`: Tells our database connection tool to create a local SQLite database file named `library.db` in the root folder of our project. 
*   **Why we do this**: Putting this in a `.env` file means we keep settings separate from code. If we deploy to Render or AWS and switch to a PostgreSQL database later, we **only** have to change this single line in `.env` (e.g., to `postgresql://user:pass@host/db`) without touching any Python files.

---

### 📄 `app/config.py`
Create this file to load variables from `.env` using Pydantic:
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
```

#### 🔍 Line-by-Line Explanation:
*   `class Settings(BaseSettings)`: Defines a configuration class. Pydantic will automatically look for environment variables matching the class fields (like `DATABASE_URL`).
*   `model_config = SettingsConfigDict(env_file=".env", extra="ignore")`: Tells Pydantic to read variables from the `.env` file in the root directory. `extra="ignore"` ensures that if there are extra variables we don't care about, they won't cause crashes.
*   `settings = Settings()`: Instantiates the settings object so other files can import and use it immediately (e.g., `from app.config import settings`).

---

## 2. Database Engine & Session Handling

### 📄 `app/database.py`
This file configures the connection bridge to your database:
```python
from sqlmodel import create_engine, Session
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread": False}
)

def get_session():
    with Session(engine) as session:
        yield session
```

#### 🔍 Line-by-Line Explanation:
*   `from sqlmodel import create_engine, Session`: Imports the tools needed to build the database engine and open transactional sessions.
*   `engine = create_engine(...)`: Creates the global engine object. This is the entry point that actually handles talking to the SQLite database.
    *   `settings.DATABASE_URL`: Pulls the connection string we set up in `config.py`.
    *   `echo=True`: Tells SQLModel to print every generated raw SQL command directly to the terminal. This is incredibly helpful for learning SQL and debugging queries.
    *   `connect_args={"check_same_thread": False}`: SQLite-specific safety flag. By default, SQLite only allows one thread to access it at a time. Because FastAPI handles requests concurrently on multiple threads, we disable this check to allow concurrent requests safely.
*   `def get_session()`: A generator function that handles database connections for individual API requests.
    *   `with Session(engine) as session`: Opens a database connection session. The `with` statement guarantees that the session will be cleaned up even if our code crashes.
    *   `yield session`: Hands the active database session over to whichever API endpoint requested it.
    *   **How it connects**: After the API endpoint finishes executing and returns a response, the function resumes automatically and closes the database connection, preventing memory/connection leaks.

---

## 3. Database Table Definitions

### 📄 `app/books/models.py`
This defines what a "Book" looks like inside your SQLite database:
```python
from typing import Optional
from sqlmodel import SQLModel, Field

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    author: str
    isbn: str = Field(unique=True)
    status: str = Field(default="Available")
```

#### 🔍 Line-by-Line Explanation:
*   `from typing import Optional`: Imports Python's type hint helper.
*   `from sqlmodel import SQLModel, Field`: `SQLModel` is the base class for defining database tables. `Field` is used to add metadata to columns (like primary keys, unique constraints, and defaults).
*   `class Book(SQLModel, table=True)`: Creates a table class. Crucially, `table=True` tells SQLModel that this is **not** a regular data validator class; it represents a physical table inside SQLite (which will be named `book`).
*   `id: Optional[int] = Field(default=None, primary_key=True)`:
    *   `primary_key=True`: Tells SQLite that this is the unique identifier for every row. SQLite will automatically increment this number (1, 2, 3...) when we add new books.
    *   `Optional[int] = Field(default=None)`: When we create a book, we don't have an ID yet because the database generates it. This allows Python to accept a `None` value initially.
*   `title: str` & `author: str`: Simple text columns that are required. If a client attempts to save a book without these, SQLite/FastAPI will reject it.
*   `isbn: str = Field(unique=True)`: Sets up a unique constraint on the database level. If a user tries to add two books with the exact same ISBN (e.g. `978-3-16-148410-0`), the database will throw an error instead of saving duplicates.
*   `status: str = Field(default="Available")`: Sets up a default value. If we don't specify a status when adding a book, it defaults to `"Available"`.

---

## 4. API Request & Response Schemas

### 📄 `app/books/schemas.py`
This defines the structures of data coming into the API and leaving the API:
```python
from pydantic import BaseModel

class BookCreate(BaseModel):
    title: str
    author: str
    isbn: str

class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    isbn: str
    status: str
```

#### 🔍 Line-by-Line Explanation:
*   `from pydantic import BaseModel`: Imports the standard data validator class.
*   **Why do we separate Schemas from Models? (Separation of Concerns)**:
    *   If we used the `Book` model for everything, the client would have to pass an `id` and a `status` when creating a book, which they shouldn't do (the database should auto-generate the ID, and the status should default to `"Available"`).
    *   `BookCreate`: This defines exactly what fields are required when adding a book. Notice that it does **not** include `id` or `status`.
    *   `BookResponse`: This defines the structure of data we send back to the user. In the database, we might have internal fields we want to hide (like hashed passwords or tracking dates), but using a dedicated response schema ensures we only expose clean, intended information (like the auto-generated `id` and `status`).

---

## 5. Service Layer (Business Logic)

### 📄 `app/books/service.py`
This file isolates all raw database operations from the API endpoints. Your routes should never query the database directly; they should delegate to this layer.
```python
from sqlmodel import Session, select
from app.books.models import Book
from app.books.schemas import BookCreate

class BookService:
    @staticmethod
    def get_all_books(session: Session):
        statement = select(Book)
        return session.exec(statement).all()

    @staticmethod
    def get_book_by_id(session: Session, book_id: int):
        return session.get(Book, book_id)

    @staticmethod
    def create_book(session: Session, book_data: BookCreate):
        db_book = Book(**book_data.model_dump())
        session.add(db_book)
        session.commit()
        session.refresh(db_book)
        return db_book

    @staticmethod
    def delete_book(session: Session, db_book: Book):
        session.delete(db_book)
        session.commit()
```

#### 🔍 Line-by-Line Explanation:
*   `class BookService`: A clean class holding static methods. This keeps book operations grouped nicely.
*   `statement = select(Book)`: Under the hood, this translates to `SELECT * FROM book;`.
*   `session.exec(statement).all()`: Executes the query statement and returns all records as a list of Python `Book` objects.
*   `session.get(Book, book_id)`: A highly optimized, direct lookup. It searches the table specifically by its primary key (`id`). If the book doesn't exist, it returns `None`.
*   `db_book = Book(**book_data.model_dump())`:
    *   `book_data.model_dump()`: Converts our incoming Pydantic schema (`BookCreate`) into a standard Python dictionary (e.g. `{"title": "...", "author": "...", "isbn": "..."}`).
    *   `Book(**...)`: Unpacks that dictionary into the constructor of our SQLModel table class, making it a database-ready object.
*   `session.add(db_book)`: Tells the session to start tracking this new object for insertion.
*   `session.commit()`: Writes the transaction permanently to our SQLite file on the disk.
*   `session.refresh(db_book)`: Force-reloads the object from the database so that our Python object gets populated with its newly created `id` and the default `"Available"` status.
*   `session.delete(db_book)`: Tells the session to delete the row corresponding to this book.

---

## 6. API Route Handlers

### 📄 `app/books/router.py`
This turns your service operations into HTTP endpoints that the internet can talk to.
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.database import get_session
from app.books.models import Book
from app.books.schemas import BookCreate, BookResponse
from app.books.service import BookService

book_router = APIRouter(prefix="/books", tags=["books"])

@book_router.post("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(book_data: BookCreate, session: Session = Depends(get_session)):
    # Check if a book with the same ISBN already exists
    existing_book = session.exec(select(Book).where(Book.isbn == book_data.isbn)).first()
    if existing_book:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Book with ISBN '{book_data.isbn}' already exists."
        )
    return BookService.create_book(session, book_data)

@book_router.get("/", response_model=List[BookResponse])
def get_all_books(session: Session = Depends(get_session)):
    return BookService.get_all_books(session)

@book_router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: int, session: Session = Depends(get_session)):
    db_book = BookService.get_book_by_id(session, book_id)
    if not db_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found"
        )
    return db_book

@book_router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, session: Session = Depends(get_session)):
    db_book = BookService.get_book_by_id(session, book_id)
    if not db_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found"
        )
    BookService.delete_book(session, db_book)
    return None
```

#### 🔍 Line-by-Line Explanation:
*   `book_router = APIRouter(prefix="/books", tags=["books"])`: Creates an isolated router container. The prefix `/books` means all routes inside this file will be prefixed with `/books` (e.g. `POST /books/`, `GET /books/{id}`). The `tags` group them together in the Swagger documentation.
*   `Depends(get_session)`: **Dependency Injection**. When a client triggers this endpoint:
    1. FastAPI calls `get_session()`.
    2. `get_session()` opens a database transaction and yields it.
    3. FastAPI injects this connection into our `session` variable.
    4. The endpoint runs its queries.
    5. Once finished, FastAPI automatically closes the database session via the cleanup inside `get_session()`.
*   `response_model=BookResponse`: Tells FastAPI to automatically filter the return database object through the `BookResponse` schema, stripping out any unexpected variables.
*   `HTTPException(status_code=..., detail=...)`: Used to gracefully exit requests and return clear, clean errors to the client rather than letting the application crash with a generic `500 Internal Server Error`.
    *   `409 Conflict`: Returned if the user tries to add an ISBN that already exists.
    *   `404 Not Found`: Returned if the requested book ID does not exist.

---

## 7. App Entry Point & Database Startup

### 📄 `app/main.py`
This is the root of your application. It brings all routers together and initializes the physical SQLite tables when you boot the server.
```python
from fastapi import FastAPI
from contextlib import asynccontextmanager
from sqlmodel import SQLModel

from app.database import engine
from app.books.router import book_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This block executes when the server starts up
    SQLModel.metadata.create_all(engine)
    yield
    # This block executes when the server shuts down

app = FastAPI(
    title="Library Management API",
    description="A professional library API using FastAPI and SQLModel",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(book_router)
```

#### 🔍 Line-by-Line Explanation:
*   `from contextlib import asynccontextmanager`: Imports a context manager hook to handle start/stop tasks.
*   `@asynccontextmanager async def lifespan(app: FastAPI)`: Defines the lifespan event handler of the app. This is the modern, recommended way in FastAPI (replacing `@app.on_event("startup")`).
*   `SQLModel.metadata.create_all(engine)`:
    *   **How it works**: Reads all python files imported into the app. When it sees any class marked with `table=True` (like our `Book` class in `models.py`), it creates a table matching that design in our SQLite file (`library.db`).
    *   **Why it only runs on startup**: We only need to check and create tables once when the server boots. If the tables already exist, this command safely skips them.
*   `yield`: Marks the boundary. Everything before `yield` runs on startup; everything after runs when the server is turned off.
*   `app.include_router(book_router)`: Registers the routes we defined in `app/books/router.py` to the main FastAPI app instance. Without this line, the server wouldn't know the `/books` endpoints exist.




so heres the thing : i was doing this using a paid udemy course but the instrustor is wired so this is the course structure i was going to learn throught the course. i will now be learning from here and researching topics from youtube myself:
Database Model vs API Schema
5:18
Explore the difference between sql models and api schemas, and how sqlmodel inherits pydantic for validation. Choose to use a single model or separate schemas in fastapi endpoints.

Async IO

Synchronous Programming
6:15
Explore how FastAPI uses asynchronous programming to handle multiple requests while waiting for database responses, then simulate delays with time.sleep to test endpoints.

Async & Await
7:56
Convert synchronous functions into asynchronous ones by using the async keyword, work with coroutines and await to run code, and orchestrate coroutine execution with asyncio for endpoints and servers.

Task
3:58
Learn to build asynchronous endpoints by marking functions as coroutines, using await and async io run, creating tasks, and coordinating requests with wait for efficient, parallel execution.

Task Group
4:48
Explore using async task groups to create and await multiple coroutines efficiently, with context managed by the with statement and async keyword, handling IO-bound tasks like database queries.

PostgreSQL

Overview
0:44
Learn to upgrade from SQLite to PostgreSQL in a FastAPI backend by installing PostgreSQL, creating a database, configuring access, and adding an asynchronous database session for endpoints.

Installation
6:29
Install and configure PostgreSQL on your system, including the Postgres server and Pgadmin, set a superuser password, and use the default port 5432.

Environment Variable
11:39
Create a Postgres database with pgAdmin, then read credentials from a .env file into your FastAPI project using pydantic settings to build a Postgres URL for secure connections.

Async Session
4:25
Switch to an asynchronous workflow by using SQLAlchemy's async engine and async session with the Postgres URL from settings, wrapping in a sessionmaker for endpoints.

API Router
8:09
Learn to structure a fastapi backend by creating an api router, turning endpoints asynchronous, and organizing routes, schemas, and database sessions for scalable backends.

Service Layer
10:19
Define a shipment service class to isolate database interactions from endpoint handlers and expose async methods for get, add, update, and delete shipments.

Dependency Chaining
11:17
General Tips
7:00
Organize endpoints with an API router by setting a default shipment prefix and tags. Apply global dependencies, router lifespan, and formatting tips for cleaner FastAPI code.

Register User

Overview
2:15
Register seller accounts with email and password, hash passwords before storing, and implement a seller model and service to handle authentication and access to restricted endpoints.

Seller Model
3:10
Define a seller SQL model to create a sellers table with an auto-incrementing primary key and store a password hash using a pedantic email type.

Signup Endpoint
6:47
Define a post signup endpoint at /seller/signup to create a new seller, accepting request body data with a seller create schema, and organize routes with a master api router.

Password Hash
11:59
Create a seller service to handle database interactions, hash passwords with bcrypt via a password context, and store the hashed password in the database using async sessions.

Seller Service
5:00
Wire a seller service as a dependency to an endpoint that registers a seller using seller create data, returns a seller read with name and email, and hashes the password.

Login User

OAuth2 Overview
2:32
Authenticate users with the OAuth two password flow by validating credentials, issuing an encoded token with user data, and using it in request headers to access protected routes.

Password Request Form
8:20
Verify Password
2:18
Verify the seller's password by comparing the plain input to the stored hash after confirming email; raise an http exception on mismatch, and encode verified seller data into a token.

JWT
14:04
Generate and validate a JWT for seller authentication using PyJWT, encoding a payload with user data, header, and signature, and enforce expiry via exp and environment variables.

Password Flow
1:37
Protect api endpoints by validating access tokens in the authorization header using jwt and a secret key, then decode the token to identify the user in FastAPI.

OAuth2 Scheme
7:29
Learn how to protect a dashboard endpoint with OAuth2 password bearer by wiring a token URL as a dependency, obtaining and using the access token via the authorization header.

Decode JWT
9:50
Generate and decode JWT tokens using a utils module, signing payloads with a secret key and expiry, and validate tokens to authenticate users via fastapi endpoints.

Identify User
3:48
Identify the authenticated user from the access token by decoding its data, fetch the seller by id with a session get, and implement a dependency for user identification across endpoints.

User Dependency
5:50
Protect routes with oauth2 password flow as a dependency, validate the access token, and fetch the current seller from token data using a database session.

Token Expiry
4:56
Explore implementing access token expiration with JWT by enforcing UTC timestamps, decoding tokens, and handling invalid or expired tokens to protect endpoints and require re-login.

API Client Authentication
1:58
Authenticate using the authorization header and OAuth 2 password bearer flow to fetch an access token in a SQL API client and automatically include it in requests.

HTTP Bearer
7:00
Protect endpoints by applying the oauth2 password bearer scheme, extracting and validating the access token from the authorization header, and enforcing 401 on invalid tokens.

Logout User

Overview
2:14
Learn to authenticate users with access tokens, attach a unique ID to each token, invalidate them on logout via a blacklist, and use Redis with FastAPI.

Identify JWT
4:21
Create a logout endpoint that invalidates the access token by extracting the JWT token id (jti), generating a unique id with uuid4, and storing it in a blacklist database.

Redis
11:25
Set up Redis and RedisAI, connect from Python, and build a token blacklist using key value pairs across databases. Verify with ping, exists checks, and optional async IO for performance.

Token Blacklist
6:27
SQL Relations

Overview
1:34
Foreign Keys
7:12
UUID
5:24
Relate User
3:28
Debugging
2:08
Alembic Data Migrations

Setup
5:32
Revision Script
10:51
Autogenerate Revision
3:46
Delivery Partner

Overview
0:51
Database Model
12:40
Partner Endpoints
8:57
Base Service
16:27
User Service
14:13
Debugging
8:46
Shipment Event

Overview
1:30
Event Model
10:11
Service Layer
13:14
Event Timeline
11:51
Debugging Endpoints
4:19
Cancel Shipment
6:24
Send Mail

Mail Client Setup
8:01
Event Updates
13:28
Background Tasks
6:03
Mail Template
11:43
Customer Response

HTML Response
6:34
Template Response
17:49
Response Class
13:10
Email Confirmation

Overview
2:55
URL Safe Token
9:37
Registration Email
6:45
Verify Endpoint
7:39
Password Reset

Overview
9:40
Reset Endpoint
7:59
Password Reset Form
13:14
SMS

Overview
1:22
Twilio Setup
5:34
Send SMS
7:05
Verification Code
7:48
Review

Overview
1:06
Review Model
4:04
Review Link
2:29
Endpoints
4:56
HTML Form
9:19
Salary

Overview
2:22
Background Worker
13:21
Task Function
4:34
Flower Monitoring
9:35
Many-to-Many

Overview
1:53
Link Model
8:26
Shipment Tags
9:19
Tagged Shipments
3:13
Extra Fields
9:24
Error Handling

Exception
10:34
Add Handlers
9:57
Other Exceptions
5:58
API Middlewares

Add Middleware
9:25
CORS Middleware
5:41
API Documentation

General Metadata
9:40
Endpoint Metadata
7:26
Model Metadata
4:34
PyTest

Write Test
3:59
Run Test
5:07
Test State Example
3:41
Pytest Fixture
6:26
Fixture Scope
3:27
API Testing

Test Endpoint
11:31
Async Test
6:18
Override Dependency
6:31
Test Database
13:46
Authentication
10:57
Automate Testing
3:10
ReactJS

Overview
1:59
Setup
6:43
Component State
14:47
Forms
15:44
Context Provider
15:43
Axios Client
12:04
Swagger Typescript API
7:18
Tanstack React Query
8:57
Front End

Setup
8:41
Login Page
22:00
Route Authentication
8:41
User Type
14:16
Dashboard Page
12:17
Account Page
5:55
Submit Shipment Page
8:24
Update Shipment Page
8:24
QR Scanning
14:02
Docker

Introduction
2:44
Docker Containers
15:24
API Server
14:56
PostgreSQL Database
11:08
Docker Compose
11:32
Backend
6:31
Deployment

Render
1:02
PostgreSQL & Redis
4:49
Web Service
8:34
API Gateway

Introduction
1:34
AWS CLI Setup
2:26
AWS Elastic Container Registry
4:51
AWS App Runner
3:58
AWS API Gateway
13:49
Caching
4:42
Tips and Tricks

File Structure
3:45
Pagination
13:52
Logging
11:01
Bonus Lecture
END