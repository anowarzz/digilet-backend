import { Query } from "mongoose";
import { excludedFields } from "../constants";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  filter(): this {
    const filter = { ...this.query };

    for (const field of excludedFields) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete filter[field];
    }

    this.modelQuery = this.modelQuery.find(filter);

    return this;
  }

  sort(): this {
    const sort = this.query.sort || "-createdAt";

    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }

  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 20;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const currentFilter = this.modelQuery.getFilter();

    //  documents that match the current filter
    const totalDocuments = await this.modelQuery.model.countDocuments(
      currentFilter
    );

    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 20;

    const totalPages = Math.ceil(totalDocuments / limit);

    return { page, limit, total: totalDocuments, totalPages };
  }
}
