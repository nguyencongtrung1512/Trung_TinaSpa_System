import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { BlogCategoriesService } from './blog-categories.service.js';
import { ManageBlog } from './blog.constants.js';
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
  @ManageBlog()
  listForManage() {
    return this.categories.listForManage();
  }

  @Post()
  @ManageBlog()
  create(@Body() dto: SaveBlogCategoryDto, @CurrentUser('userAID') userAID: string) {
    return this.categories.create(dto, userAID);
  }

  @Patch(':blogCategoryID')
  @ManageBlog()
  update(
    @Param('blogCategoryID') blogCategoryID: string,
    @Body() dto: SaveBlogCategoryDto,
  ) {
    return this.categories.update(blogCategoryID, dto);
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
  @ManageBlog()
  listForManage(@Query() query: ManageBlogsQueryDto) {
    return this.blogs.listForManage(query);
  }

  @Get('manage/:blogID')
  @ManageBlog()
  findForManage(@Param('blogID') blogID: string) {
    return this.blogs.findForManage(blogID);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogs.findPublishedBySlug(slug);
  }

  @Post()
  @ManageBlog()
  create(@Body() dto: SaveBlogDto, @CurrentUser('userAID') userAID: string) {
    return this.blogs.create(dto, userAID);
  }

  @Patch(':blogID')
  @ManageBlog()
  update(
    @Param('blogID') blogID: string,
    @Body() dto: SaveBlogDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.blogs.update(blogID, dto, userAID);
  }
}
