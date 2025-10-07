import {
  createManyParamsTG,
  createOneParamsTG,
  getOneParamsTG,
} from "@core/db/models";
import { DrizzleOptions } from "@core/db/types";

import { ParamsExtractor } from "./paramsExtractor";

export class ParamsExtractorDB extends ParamsExtractor {
  key_db = "_db_params";
  private key_relation: string | null = null;

  constructor(
    inputString: string,
    { key_relation }: { key_relation?: string } = {},
  ) {
    super(inputString);
    this.key_relation = key_relation ?? null;
  }

  private async createParamDB(options: DrizzleOptions = {}) {
    const params = { ...this.params };
    const record = await createOneParamsTG(
      {
        data: params,
        relationKey: this.key_relation ?? undefined,
      },
      options,
    );
    return record.id;
  }

  async getParamsDB(id: number) {
    const record = await getOneParamsTG({ id });

    if (!record) {
      throw new Error("ParamsTG id not found");
    }

    const data = record.data;

    return data;
  }

  toStringDB(options?: { route: string }) {
    const { route = this.route } = options ?? {};
    const id = this.params[this.key_db];
    return this.toString({ route, params: { [this.key_db]: id } });
  }

  async toStringAsync(
    options: DrizzleOptions & { isCleanParams?: boolean } = {
      isCleanParams: true,
    },
  ) {
    const id = await this.createParamDB(options);
    if (options.isCleanParams) this.clearParams();
    this.addParam(this.key_db, id);
    return this.toString();
  }

  static async createManyAsync(
    instances: ParamsExtractorDB[],
    options: DrizzleOptions = {},
  ): Promise<string[]> {
    if (instances.length === 0) {
      return [];
    }

    const dataToInsert = instances.map(instance => ({
      data: { ...instance.params },
      relationKey: instance.key_relation ?? undefined,
    }));

    const records = await createManyParamsTG(dataToInsert, options);

    const results: string[] = [];
    for (const [index, instance] of instances.entries()) {
      const record = records[index];

      instance.clearParams();
      instance.addParam(instance.key_db, record.id);
      results.push(instance.toString());
    }

    return results;
  }
}
