import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthUser } from '../auth/types/auth-user.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { BlogCategoriesService } from './blog-categories.service.js';
import { ViewBlogManagement, WriteBlog, WriteBlogCategory } from './blog.constants.js';
import { BlogService } from './blog.service.js';
import { SaveBlogCategoryDto } from './dto/blog-category.dto.js';
import {
  ListBlogsQueryDto,
  ManageBlogsQueryDto,
  SaveBlogDto,
} from './dto/blog.dto.js';

@Controller('blog-categories')
export class BlogCategoriesController {
  constructor(private readonly categories: BlogCategoriesService) {}

  @Get()
  list() {
    return this.categories.list();
  }

  @Get('manage')
  @ViewBlogManagement()
  listForManage() {
    return this.categories.listForManage();
  }

  @Get('manage/:blogCategoryID')
  @ViewBlogManagement()
  findForManage(@Param('blogCategoryID') blogCategoryID: string) {
    return this.categories.findForManage(blogCategoryID);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categories.findBySlug(slug);
  }

  @Post()
  @WriteBlogCategory()
  create(@Body() dto: SaveBlogCategoryDto, @CurrentUser('userAID') userAID: string) {
    return this.categories.create(dto, userAID);
  }

  @Patch(':blogCategoryID')
  @WriteBlogCategory()
  update(
    @Param('blogCategoryID') blogCategoryID: string,
    @Body() dto: SaveBlogCategoryDto,
  ) {
    return this.categories.update(blogCategoryID, dto);
  }

  @Delete(':blogCategoryID')
  @WriteBlogCategory()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('blogCategoryID') blogCategoryID: string) {
    return this.categories.remove(blogCategoryID);
  }
}

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogs: BlogService) {}

  @Get()
  list(@Query() query: ListBlogsQueryDto) {
    return this.blogs.list(query);
  }

  @Get('manage')
  @ViewBlogManagement()
  listForManage(
    @Query() query: ManageBlogsQueryDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.blogs.listForManage(query, actor);
  }

  @Get('manage/:blogID')
  @ViewBlogManagement()
  findForManage(@Param('blogID') blogID: string) {
    return this.blogs.findForManage(blogID);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogs.findPublishedBySlug(slug);
  }

  @Post()
  @WriteBlog()
  create(@Body() dto: SaveBlogDto, @CurrentUser() actor: AuthUser) {
    return this.blogs.create(dto, actor);
  }

  @Patch(':blogID')
  @WriteBlog()
  update(
    @Param('blogID') blogID: string,
    @Body() dto: SaveBlogDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.blogs.update(blogID, dto, actor);
  }
}
